using System;
using System.Linq;
using System.Threading.Tasks;
using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Kcesar.Training.Website.Controllers
{
  [Authorize]
  public class ScheduleController : Controller
  {
    private readonly TrainingContext _db;

    public ScheduleController(TrainingContext db)
    {
      _db = db;
    }

    class OfferingWithCounts
    {
      public CourseOffering O { get; set; }
      public int Current { get; set; }
      public int Waiting { get; set; }
    }

    private IQueryable<OfferingWithCounts> GetOfferingsQuery(IQueryable<CourseOffering> source)
    {
      return source.Select(f => new OfferingWithCounts { O = f, Current = f.Signups.Where(g => !g.OnWaitList && g.CapApplies && !g.Deleted).Count(), Waiting = f.Signups.Where(g => g.OnWaitList && !g.Deleted).Count() });
    }


    [AllowAnonymous]
    [HttpGet("/api/schedule")]
    public async Task<object> Get()
    {
      var sessions = await GetOfferingsQuery(_db.Offerings.AsNoTracking()).ToListAsync();
      return TransformSessionList(sessions, null);
    }

    [HttpGet("/api/schedule/{memberId}")]
    public async Task<object> GetForMember(string memberId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isMember = User.FindFirst(f => f.Type == "role" && f.Value == "sec.esar.members") != null;

      if (!isMember && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't see other persons schedule");

      memberId = memberId ?? User.FindFirst("memberId").Value;

      var sessions = await GetOfferingsQuery(_db.Offerings.AsNoTracking()).ToListAsync();
      var signups = await _db.Signups.AsNoTracking().Where(f => f.MemberId == memberId && !f.Deleted).ToListAsync();

      return TransformSessionList(sessions, signups);
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

    [HttpPost("/api/schedule/{memberId}/session/{sessionId}")]
    public async Task<object> Register(string memberId, int sessionId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isAdmin = User.FindFirst(f => f.Type == "role" && f.Value == "esar.training") != null;
      if (!isAdmin && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't change other persons schedule");

      var offer = await GetOfferingsQuery(_db.Offerings.AsNoTracking().Where(f => f.Id == sessionId)).SingleOrDefaultAsync();
      if (offer == null) throw new Exception("Session not found");
      var existing = await _db.Signups.AsNoTracking().Where(f => f.MemberId == memberId && f.Offering.CourseName == offer.O.CourseName && !f.Deleted).ToListAsync();

      if (existing.Any(f => f.OfferingId == sessionId)) throw new Exception("Already registered for this session");

      bool isWaitList = offer.Waiting > 0 || offer.Current >= offer.O.Capacity;

      _db.Signups.Add(new CourseSignup
      {
        Created = DateTimeOffset.UtcNow,
        MemberId = memberId,
        Name = "",
        OfferingId = sessionId,
        OnWaitList = isWaitList
      });
      await _db.SaveChangesAsync();

      return GetForMember(memberId);
    }

    [HttpDelete("/api/schedule/{memberId}/session/{sessionId}")]
    public async Task<object> Leave(string memberId, int sessionId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isAdmin = User.FindFirst(f => f.Type == "role" && f.Value == "esar.training") != null;
      if (!isAdmin && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't change other persons schedule");

      var offer = await GetOfferingsQuery(_db.Offerings.AsNoTracking().Where(f => f.Id == sessionId)).SingleOrDefaultAsync();
      if (offer == null) throw new Exception("Session not found");

      var existing = await _db.Signups.Where(f => f.MemberId == memberId && f.Offering.Id == sessionId && !f.Deleted).FirstOrDefaultAsync();
      if (existing == null) throw new Exception("Signup not found");

      existing.Deleted = true;
      await _db.SaveChangesAsync();


      return GetForMember(memberId);
    }
  }
}
