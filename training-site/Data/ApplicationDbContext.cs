using IdentityServer4.EntityFramework.Options;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Kcesar.TrainingSite.Data
{
  public class ApplicationDbContext : ApiAuthorizationDbContext<ApplicationUser>
  {
    protected readonly string connectionString;

    public ApplicationDbContext(
        IConfiguration config,
        DbContextOptions options,
        IOptions<OperationalStoreOptions> operationalStoreOptions) : this(config.GetConnectionString("SqliteConnection"), options, operationalStoreOptions)
    {
    }

    public ApplicationDbContext(
      string connectionString,
      DbContextOptions options,
      IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
    {
      this.connectionString = connectionString;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
      base.OnConfiguring(optionsBuilder);
      SetProvider(optionsBuilder);
    }

    protected virtual void SetProvider(DbContextOptionsBuilder optionsBuilder)
    {
      optionsBuilder.UseSqlite(connectionString);
    }

    public DbSet<CourseOffering> Offerings { get; set; }
    public DbSet<CourseSignup> Signups { get; set; }
  }
}
