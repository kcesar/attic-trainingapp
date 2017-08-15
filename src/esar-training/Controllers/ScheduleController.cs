using System;
using System.Linq;
using System.Threading.Tasks;
using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    [HttpGet("/api/schedule/{memberId}")]
    public async Task<object> Default(string memberId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isMember = User.FindFirst(f => f.Type == "role" && f.Value == "sec.esar.members") != null;

      if (!isMember && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't see other persons schedule");

      memberId = memberId ?? User.FindFirst("memberId").Value;

      var sessions = await _db.Offerings.Select(f => new { O = f, Current = f.Signups.Where(g => !g.OnWaitList).Count(), Waiting = f.Signups.Where(g => g.OnWaitList).Count() }).ToListAsync();
      var signups = await _db.Signups.Where(f => f.MemberId == memberId).ToListAsync();

      return new
      {
        Items = sessions.GroupBy(f => f.O.CourseName, f => f).ToDictionary(g => g.Key, g => g.OrderBy(f => f.O.When).Select(f =>
        (object)new
        {
          When = f.O.When,
          Location = f.O.Location,
          Capacity = f.O.Capacity,
          Current = f.Current,
          Registered = signups.Where(h => h.OfferingId == f.O.Id).Select(h => h.OnWaitList ? "wait" : "yes").FirstOrDefault() ?? "no"
        }).ToArray())
      };
    }
  }
}
