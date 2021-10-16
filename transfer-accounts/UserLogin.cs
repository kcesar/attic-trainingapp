using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace transfer_accounts
{
  [Table("AspNetUserLogins", Schema = "auth")]

  public class UserLogin
  {
    public string LoginProvider { get; set; }
    public string ProviderKey { get; set; }
    public string ProviderDisplayName { get; set; }

    [Key]
    public string UserId { get; set; }
  }
}
