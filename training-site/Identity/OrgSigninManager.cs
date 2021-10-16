using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Kcesar.TrainingSite.Identity
{
  internal class OrgSigninManager : SignInManager<ApplicationUser>
  {
    private readonly IConfiguration config;
    private readonly RoleManager<IdentityRole> roles;

    public OrgSigninManager(IConfiguration config, RoleManager<IdentityRole> roles, UserManager<ApplicationUser> userManager, IHttpContextAccessor contextAccessor, IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory, IOptions<IdentityOptions> optionsAccessor, ILogger<SignInManager<ApplicationUser>> logger, IAuthenticationSchemeProvider schemes, IUserConfirmation<ApplicationUser> confirmation) 
      : base(userManager, contextAccessor, claimsFactory, optionsAccessor, logger, schemes, confirmation)
    {
      this.config = config;
      this.roles = roles;
    }

    public override Task<SignInResult> ExternalLoginSignInAsync(string loginProvider, string providerKey, bool isPersistent)
    {
      return base.ExternalLoginSignInAsync(loginProvider, providerKey, isPersistent);
    }

    public override async Task<SignInResult> ExternalLoginSignInAsync(string loginProvider, string providerKey, bool isPersistent, bool bypassTwoFactor)
    {
      var result = await base.ExternalLoginSignInAsync(loginProvider, providerKey, isPersistent, bypassTwoFactor);
      var info = await GetExternalLoginInfoAsync();
      if (result.Succeeded)
      {
        var user = await UserManager.FindByLoginAsync(loginProvider, providerKey);
        
        user.FirstName = info.Principal.FindFirst(ClaimTypes.GivenName).Value;
        user.LastName = info.Principal.FindFirst(ClaimTypes.Surname).Value;
        user.LastLogin = DateTimeOffset.Now;

        await UserManager.UpdateAsync(user);
      }
      else if (!(result.IsLockedOut || result.IsNotAllowed))
      {
        var domain = info.Principal.FindFirst("domain").Value;
        if (domain == config["auth:google:domains"])
        {
          var user = new ApplicationUser
          {
            UserName = info.Principal.FindFirst(ClaimTypes.Email).Value,
            Email = info.Principal.FindFirst(ClaimTypes.Email).Value,
            FirstName = info.Principal.FindFirst(ClaimTypes.GivenName).Value,
            LastName = info.Principal.FindFirst(ClaimTypes.Surname).Value,
            EmailConfirmed = true,
            Created = DateTimeOffset.Now,
            LastLogin = DateTimeOffset.Now
          };
          var identityResult = await UserManager.CreateAsync(user);
          await UserManager.AddLoginAsync(user, info);

          var initRoles = (config[$"auth:google:{domain}:initialRoles"] ?? string.Empty).Split(',').Select(f => f.Trim()).Where(f => f.Length > 0);
          foreach (var role in initRoles)
          {
            if (!await roles.RoleExistsAsync(role)) await roles.CreateAsync(new IdentityRole(role));
          }
          await UserManager.AddToRolesAsync(user, initRoles);

          result = await base.ExternalLoginSignInAsync(loginProvider, providerKey, isPersistent, bypassTwoFactor);
        }
      }
      return result;
    }

    public override Task SignInAsync(ApplicationUser user, AuthenticationProperties authenticationProperties, string authenticationMethod = null)
    {
      return base.SignInAsync(user, authenticationProperties, authenticationMethod);
    }

    public override Task SignInAsync(ApplicationUser user, bool isPersistent, string authenticationMethod = null)
    {
      return base.SignInAsync(user, isPersistent, authenticationMethod);
    }
  }
}