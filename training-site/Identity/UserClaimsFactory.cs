
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Kcesar.TrainingSite.Identity
{
  public class UserClaimsFactory : UserClaimsPrincipalFactory<ApplicationUser,IdentityRole>
  {
    public UserClaimsFactory(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IOptions<IdentityOptions> optionsAccessor)
    : base(userManager, roleManager, optionsAccessor)
    {
    }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
      var identity = await base.GenerateClaimsAsync(user);

      identity.RemoveClaim(identity.FindFirst("name"));
      identity.AddClaim(new Claim("name", user.FirstName + " " + user.LastName));


      var roles = await UserManager.GetRolesAsync(user);
      identity.AddClaims(roles.Select(role => new Claim(JwtClaimTypes.Role, role)));

      return identity;
    }
  }
}
