using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Kcesar.TrainingSite.Identity
{
  public class AuthorizationService
  {
    private readonly AppUserManager users;

    public AuthorizationService(AppUserManager users)
    {
      this.users = users;
    }

    public async Task AssertIsMemberOrSelf(ClaimsPrincipal user, string traineeId)
    {      
      if (!await IsInRole(user, "members") && !IsSelf(user, traineeId))
      {
        throw new HttpResponseException(403, "Insufficient permission");
      }
    }

    public async Task AssertIsAdminOrSelf(ClaimsPrincipal user, string traineeId)
    {
      if (!await IsInRole(user, "admins") && !IsSelf(user, traineeId))
      {
        throw new HttpResponseException(403, "Insufficient permission");
      }
    }

    public async Task<bool> IsInRole(ClaimsPrincipal user, string role)
    {
      var u = await users.FindByIdAsync(user.FindFirstValue(ClaimTypes.NameIdentifier));
      var roles = await users.GetRolesAsync(u);
      return roles.Any(r => r.Equals(role));
    }

    public static bool IsSelf(ClaimsPrincipal user, string traineeId)
    {
      return (user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty).Equals(traineeId, StringComparison.OrdinalIgnoreCase);
    }
  }
}
