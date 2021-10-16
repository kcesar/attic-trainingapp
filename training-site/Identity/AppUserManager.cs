using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Kcesar.TrainingSite.Identity
{
  public class AppUserManager : UserManager<ApplicationUser>
  {
    public AppUserManager(IUserStore<ApplicationUser> store, IOptions<IdentityOptions> optionsAccessor, IPasswordHasher<ApplicationUser> passwordHasher, IEnumerable<IUserValidator<ApplicationUser>> userValidators, IEnumerable<IPasswordValidator<ApplicationUser>> passwordValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, IServiceProvider services, ILogger<UserManager<ApplicationUser>> logger) : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
    {
    }

    public override Task<IdentityResult> CreateAsync(ApplicationUser user)
    {
      user.Created = DateTimeOffset.Now;
      return base.CreateAsync(user);
    }
  }
}
