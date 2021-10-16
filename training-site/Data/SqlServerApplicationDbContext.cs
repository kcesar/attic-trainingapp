using IdentityServer4.EntityFramework.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace Kcesar.TrainingSite.Data
{
  public class SqlServerApplicationDbContext : ApplicationDbContext
  {
    public const string TABLE_SCHEMA = "trainingapp";
    public const string CONNECTION_STRING_KEY = "SqlServerConnection";

    public SqlServerApplicationDbContext(IConfiguration config, DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
      : this(config.GetConnectionString(CONNECTION_STRING_KEY), options, operationalStoreOptions)
    {
    }

    public SqlServerApplicationDbContext(string connectionString, DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
      : base(connectionString, options, operationalStoreOptions)
    {
    }

    protected override void SetProvider(DbContextOptionsBuilder optionsBuilder)
    {
      optionsBuilder.UseSqlServer(connectionString, o =>
      {
        o.MigrationsHistoryTable("__Migrations", TABLE_SCHEMA);
      });
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
      builder.HasDefaultSchema(TABLE_SCHEMA);
      base.OnModelCreating(builder);
    }
  }
}
