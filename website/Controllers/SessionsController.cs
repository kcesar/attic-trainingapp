using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Kcesar.Training.Website.Controllers
{
  [Authorize]
  public class SessionsController : Controller
  {
    private readonly TrainingContext _db;
    private readonly RolesService rolesSvc;

    public SessionsController(TrainingContext db, RolesService rolesSvc)
    {
      _db = db;
      this.rolesSvc = rolesSvc;
    }

    [HttpGet("/api/sessions/{sessionId}/roster")]
    public async Task<object> GetRoster(int sessionId)
    {
      var roles = rolesSvc.ListAllRolesForAccount(new Guid(User.FindFirst(ClaimTypes.NameIdentifier).Value));

      bool isMember = roles.Contains("sec.esar.members");

      if (!isMember) throw new Exception("not allowed");

      var signups = await _db.Signups.AsNoTracking().Where(f => f.OfferingId == sessionId && f.Deleted == false)
        .OrderBy(f => f.OnWaitList).ToListAsync();

      return signups;
    }
  }
}
