using System;
using System.Collections.Generic;
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

    [HttpGet("/api/schedule")]
    public async Task<object> Default()
    {
      string userId = User.FindFirst("sub").Value;

      var sessions = await _db.Offerings.Select(f => new { O = f, Current = f.Signups.Where(g => !g.OnWaitList).Count(), Waiting = f.Signups.Where(g => g.OnWaitList).Count() }).ToListAsync();
      var signups = await _db.Signups.Where(f => f.User == userId).ToListAsync();

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
