using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Kcesar.Training.Website.Controllers
{
  [Authorize]
  public class SessionsController : Controller
  {
    private readonly TrainingContext _db;

    public SessionsController(TrainingContext db)
    {
      _db = db;
    }

    [HttpGet("/api/sessions/{sessionId}/roster")]
    public async Task<object> GetRoster(int sessionId)
    {
      bool isMember = User.FindFirst(f => f.Type == "role" && f.Value == "sec.esar.members") != null;

      if (!isMember) throw new Exception("not allowed");

      var signups = await _db.Signups.AsNoTracking().Where(f => f.OfferingId == sessionId && f.Deleted == false)
        .OrderBy(f => f.OnWaitList).ToListAsync();

      return signups;
    }
  }
}
