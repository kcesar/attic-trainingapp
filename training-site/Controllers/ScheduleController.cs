using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kcesar.TrainingSite.Data;
using Kcesar.TrainingSite.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kcesar.TrainingSite.Controllers
{
  [Authorize]
  [Route("/api/schedule")]
  public class ScheduleController : Controller
  {
    private readonly AuthorizationService authz;
    private readonly ApplicationDbContext db;

    class OfferingWithCounts
    {
      public CourseOffering O { get; set; }
      public int Current { get; set; }
      public int Waiting { get; set; }
    }

    public ScheduleController(AuthorizationService authz, ApplicationDbContext db)
    {
      this.authz = authz;
      this.db = db;
    }

    private IQueryable<OfferingWithCounts> GetOfferingsQuery(IQueryable<CourseOffering> source)
    {
      return source.Select(f => new OfferingWithCounts { O = f, Current = f.Signups.Where(g => !g.OnWaitList && g.CapApplies && !g.Deleted).Count(), Waiting = f.Signups.Where(g => g.OnWaitList && !g.Deleted).Count() });
    }

    [AllowAnonymous]
    [HttpGet("")]
    public async Task<object> Get()
    {
      var sessions = await GetOfferingsQuery(db.Offerings.AsNoTracking()).ToListAsync();
      return TransformSessionList(sessions, null);
    }


    [HttpGet("{traineeId}")]
    public async Task<object> GetForMember(string traineeId)
    {
      await authz.AssertIsMemberOrSelf(User, traineeId);

      var user = await db.Users.SingleOrDefaultAsync(f => f.Id == traineeId);
      if (user == null) throw new HttpResponseException(404, "Not found");


      var sessions = await GetOfferingsQuery(db.Offerings.AsNoTracking()).ToListAsync();
      var signups = await db.Signups.AsNoTracking().Where(f => f.MemberId == user.Id && !f.Deleted).ToListAsync();

      return TransformSessionList(sessions, signups);
    }

    [HttpPost("/api/schedule/{traineeId}/session/{sessionId}")]
    public async Task<object> Register(string traineeId, int sessionId)
    {
      await authz.AssertIsAdminOrSelf(User, traineeId);

      var offer = await GetOfferingsQuery(db.Offerings.AsNoTracking().Where(f => f.Id == sessionId)).SingleOrDefaultAsync();
      if (offer == null) throw new Exception("Session not found");
      var existing = await db.Signups.AsNoTracking().Where(f => f.MemberId == traineeId && f.Offering.CourseName == offer.O.CourseName && !f.Deleted).ToListAsync();

      if (existing.Any(f => f.OfferingId == sessionId)) throw new Exception("Already registered for this session");

      bool isWaitList = offer.Waiting > 0 || offer.Current >= offer.O.Capacity;

      db.Signups.Add(new CourseSignup
      {
        Created = DateTimeOffset.UtcNow,
        MemberId = traineeId,
        Name = "",
        OfferingId = sessionId,
        OnWaitList = isWaitList
      });
      await db.SaveChangesAsync();

      return await GetForMember(traineeId);
    }

    [HttpDelete("/api/schedule/{traineeId}/session/{sessionId}")]
    public async Task<object> Leave(string traineeId, int sessionId)
    {
      await authz.AssertIsAdminOrSelf(User, traineeId);

      var offer = await GetOfferingsQuery(db.Offerings.AsNoTracking().Where(f => f.Id == sessionId)).SingleOrDefaultAsync();
      if (offer == null) throw new Exception("Session not found");

      var existing = await db.Signups.Where(f => f.MemberId == traineeId && f.Offering.Id == sessionId && !f.Deleted).FirstOrDefaultAsync();
      if (existing == null) throw new Exception("Signup not found");

      existing.Deleted = true;
      await db.SaveChangesAsync();


      return await GetForMember(traineeId);
    }

    [HttpGet("/api/sessions/{sessionId}/roster")]
    public async Task<object> GetRoster(int sessionId)
    {
      if (!(await authz.IsInRole(User, "admins"))) throw new HttpResponseException(403, "Insufficient permission");

      var signups = await db.Signups.AsNoTracking()
                      .Where(s => s.OfferingId == sessionId && s.Deleted == false)
                      .Join(db.Users.AsNoTracking(), s => s.MemberId, u => u.DatabaseId, (s, u) => new {
        Id = s.Id,
        CapApplies = s.CapApplies,
        Created = s.Created,
        MemberId = s.MemberId,
        OfferingId = s.OfferingId,
        OnWaitList = s.OnWaitList,
        FirstName = u.FirstName,
        LastName = u.LastName,
        Email = u.Email,
        Phone = u.PhoneNumber,
      })
      .OrderBy(f => f.OnWaitList)
      .ToListAsync();

      return signups;
    }


    private static object TransformSessionList(List<OfferingWithCounts> sessions, List<CourseSignup> signups)
    {
      return new
      {
        Items = sessions.GroupBy(f => f.O.CourseName, f => f).ToDictionary(g => g.Key, g => g.OrderBy(f => f.O.When).Select(f =>
        (object)new
        {
          Id = f.O.Id,
          When = f.O.When,
          Location = f.O.Location,
          Capacity = f.O.Capacity,
          Current = Math.Min(f.Current, f.O.Capacity),
          Waiting = f.Waiting,
          Registered = signups == null ? null : signups.Where(h => h.OfferingId == f.O.Id).Select(h => h.OnWaitList ? "wait" : "yes").FirstOrDefault() ?? "no"
        }).ToArray())
      };
    }
  }
}
