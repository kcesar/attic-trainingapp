using System;
using Microsoft.AspNetCore.Identity;

namespace Kcesar.TrainingSite.Models
{
  public class ApplicationUser : IdentityUser
  {
    public string FirstName { get; set; }
    public string LastName { get; set; }

    public string DatabaseId { get; set; }

    public DateTimeOffset Created { get; set; }

    public DateTimeOffset? LastLogin { get; set; }
  }
}
