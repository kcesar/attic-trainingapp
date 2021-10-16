using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.Identity;

namespace transfer_accounts
{
  [Table("AspNetUsers", Schema = "auth")]
  public class AuthSiteUser : IdentityUser
  {
    public string FirstName { get; set; }
    public string LastName { get; set; }

    public string MemberId { get; set; }
    public DateTimeOffset Created { get; set; }
    public DateTimeOffset? LastLogin { get; set; }
  }
}
