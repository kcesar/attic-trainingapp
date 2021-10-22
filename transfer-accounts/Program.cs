using System;
using System.Collections.Generic;
using System.Linq;
using Kcesar.TrainingSite.Data;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Primitives;

namespace transfer_accounts
{
  class Program
  {
    static readonly string SQLITE_DB = "DataSource=**HARD_CODED_PATH**\\app.db;Cache=Shared";
    static readonly string SQLSERVER_DB = "";
    static readonly string MS_DB = "Server=tcp:**HARD_CODED_STRING**;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
    static readonly string STATUS_ID = "DB-VALUE";

    static void Main(string[] args)
    {
      LocalConfiguration config = new LocalConfiguration(new Dictionary<string, string>())
         .AddSection("ConnectionStrings", new LocalConfiguration(new Dictionary<string, string> { { "SqliteConnection", SQLITE_DB } }));

      IServiceCollection services = new ServiceCollection();
      services.AddSingleton<IConfiguration>(config);
      if (string.IsNullOrWhiteSpace(SQLSERVER_DB))
      {
        services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite(SQLITE_DB));
      }
      else
      {
        services.AddDbContext<ApplicationDbContext, SqlServerApplicationDbContext>(options => options.UseSqlServer(SQLSERVER_DB));
      }
      services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
          .AddRoles<IdentityRole>()
          .AddEntityFrameworkStores<ApplicationDbContext>();

      var context = services.BuildServiceProvider();
      DateTime cutoff = new DateTime(2021, 6, 1);

      var builder = new DbContextOptionsBuilder<AuthSiteContext>().UseSqlServer(MS_DB);

      using (ApplicationDbContext dbContext = context.GetRequiredService<ApplicationDbContext>())
      {
        dbContext.Roles.Add(new IdentityRole("members"));
        dbContext.Roles.Add(new IdentityRole("trainees"));
        dbContext.Roles.Add(new IdentityRole("admins"));
        dbContext.SaveChanges();
        var rolesLookup = dbContext.Roles.ToDictionary(f => f.Name, f => f.Id);

        using (var authContext = new AuthSiteContext(builder.Options))
        {
          var logins = authContext.Logins
            .AsEnumerable()
            .GroupBy(f => f.UserId, f => f)
            .ToDictionary(f => f.Key, f => f.ToList());


          //var import = authContext.Users.Where(f => f.Created > cutoff).ToList();
          var import = authContext.Users.FromSqlRaw($"SELECT u.* FROM auth.AspNetUsers as u JOIN UnitMemberships um ON u.memberid=cast(um.person_id as CHAR(36)) AND um.endTime is null and um.status_id='{STATUS_ID}'").ToList();
          foreach (var user in import)
          {
            ApplicationUser newUser = new ApplicationUser
            {
              Id = user.Id,
              UserName = user.Email,
              NormalizedUserName = user.NormalizedEmail,
              Email = user.Email,
              NormalizedEmail = user.NormalizedEmail,
              EmailConfirmed = user.EmailConfirmed,
              PasswordHash = user.PasswordHash,
              SecurityStamp = user.SecurityStamp,
              ConcurrencyStamp = user.ConcurrencyStamp,
              PhoneNumber = user.PhoneNumber,
              PhoneNumberConfirmed = user.PhoneNumberConfirmed,
              TwoFactorEnabled = user.TwoFactorEnabled,
              LockoutEnd = user.LockoutEnd,
              LockoutEnabled = user.LockoutEnabled,
              AccessFailedCount = 0,
              DatabaseId = user.MemberId,
              Created = user.Created,
              LastLogin = user.LastLogin,
              FirstName = user.FirstName,
              LastName = user.LastName
            };

            dbContext.Users.Add(newUser);
            dbContext.UserRoles.Add(new IdentityUserRole<string> { RoleId = rolesLookup["trainees"], UserId = newUser.Id });
            if (logins.TryGetValue(user.Id, out List<IdentityUserLogin<string>> externals))
            {
              dbContext.UserLogins.AddRange(externals);
            }
          }
        }
        dbContext.SaveChanges();
      }
    }
  }

  class LocalConfiguration : IConfiguration, IConfigurationSection
  {
    readonly Dictionary<string, IConfigurationSection> sections = new ();
    readonly Dictionary<string, string> values;

    public LocalConfiguration(Dictionary<string, string> values)
    {
      this.values = values;
    }

    public string this[string key]
    {
      get
      {
        if (values.ContainsKey(key))
          return values[key];
        return null;
      }
      set
      {
        values.Add(key, value);
      }
    }

    public string Key => throw new NotImplementedException();

    public string Path => throw new NotImplementedException();

    public string Value { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public IEnumerable<IConfigurationSection> GetChildren()
    {
      throw new NotImplementedException();
    }

    public IChangeToken GetReloadToken()
    {
      throw new NotImplementedException();
    }

    public IConfigurationSection GetSection(string key)
    {
      return sections[key];
    }

    public LocalConfiguration AddSection(string key, IConfigurationSection section)
    {
      sections.Add(key, section);
      return this;
    }
  }
}

