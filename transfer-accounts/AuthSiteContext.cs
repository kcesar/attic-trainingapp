using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace transfer_accounts
{
  class AuthSiteContext : DbContext
  {
    public AuthSiteContext(DbContextOptions<AuthSiteContext> options)  :base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      modelBuilder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins", "auth").HasNoKey();
    }

    public DbSet<AuthSiteUser> Users { get; set; }
    public DbSet<IdentityUserLogin<string>> Logins { get; set; }
  }
}
