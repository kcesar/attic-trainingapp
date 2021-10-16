using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kcesar.TrainingSite.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kcesar.TrainingSite.Controllers
{
  [Authorize]
  [Route("/api/schedule")]
  public class ScheduleController : Controller
  {
    private readonly ApplicationDbContext db;

    class OfferingWithCounts
    {
      public CourseOffering O { get; set; }
      public int Current { get; set; }
      public int Waiting { get; set; }
    }

    public ScheduleController(ApplicationDbContext db)
    {
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
      //string userMemberId = User.FindFirst("memberId").Value;
      //var roles = rolesSvc.ListAllRolesForAccount(new Guid(User.FindFirst(ClaimTypes.NameIdentifier).Value));
      //bool isMember = roles.Contains("sec.esar.members");

      //if (!isMember && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't see other persons schedule");

      var user = await db.Users.SingleOrDefaultAsync(f => f.Id == traineeId);
      if (user == null) throw new HttpResponseException(404, "Not found");


      string memberId = user.DatabaseId;

      //memberId ??= User.FindFirst("memberId").Value;

      var sessions = await GetOfferingsQuery(db.Offerings.AsNoTracking()).ToListAsync();
      var signups = await db.Signups.AsNoTracking().Where(f => f.MemberId == memberId && !f.Deleted).ToListAsync();

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
  }
}
