using System;
using System.Reflection;
using Kcesar.Training.Website;
using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace esar_training
{
  public class Startup
  {
    private readonly ILogger<Startup> logger;

    private bool useMigrations = true;

    // TODO - Figure out how to get this into ApplicationDbContext
    public static string SqlDefaultSchema { get; private set; } = "trainingapp";

    public Startup(IHostingEnvironment env, ILogger<Startup> logger)
    {
      logger.LogInformation($"Starting site. Environment: {env.EnvironmentName}");

      var builder = new ConfigurationBuilder()
          .SetBasePath(env.ContentRootPath)
          .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
          .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
          .AddJsonFile($"appsettings.local.json", optional: true)
          .AddEnvironmentVariables();
      Configuration = builder.Build();
      this.logger = logger;
    }

    public IConfigurationRoot Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddSingleton(Configuration);

      AddDatabases(services);
      services.AddMemoryCache();

      // Add framework services.
      services.AddMvc();

      services.AddAuthentication("Bearer")
        .AddJwtBearer(options =>
        {
          options.Authority = Configuration["auth:authority"];
          options.TokenValidationParameters = new TokenValidationParameters
          {
            ValidAudience = Configuration["auth:authority"].Trim('/') + "/resources"
          };
          options.RequireHttpsMetadata = false;
        });

      services.AddSingleton<RolesService>();

      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "frontend/build";
      });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
      var hostingEnvironment = app.ApplicationServices.GetService<IHostingEnvironment>();

      InitializeDatabase<TrainingContext>(app);

      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
        app.UseBrowserLink();
      }
      else
      {
        app.UseExceptionHandler("/Home/Error");
      }

      app.UseAuthentication();
      app.UseStaticFiles();
      app.UseSpaStaticFiles();

      app.UseMvc();

      app.UseSpa(spa =>
      {
        spa.Options.SourcePath = "frontend";

        if (env.IsDevelopment())
        {
          spa.UseReactDevelopmentServer(npmScript: "start");
        }
      });
    }

    private Action<DbContextOptionsBuilder> AddDatabases(IServiceCollection services)
    {
      string connectionString = Configuration.GetValue<string>("database");
      string migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;

      Action<DbContextOptionsBuilder> configureDbAction = sqlBuilder => sqlBuilder.UseSqlServer(connectionString, sql => {
        sql.MigrationsAssembly(migrationsAssembly);
        sql.MigrationsHistoryTable("__Migrations", SqlDefaultSchema);
      });
      if (connectionString.ToLowerInvariant().StartsWith("filename="))
      {
        SqlDefaultSchema = null;
        useMigrations = false;
        configureDbAction = sqlBuilder => sqlBuilder.UseSqlite(connectionString, sql => sql.MigrationsAssembly(migrationsAssembly));
      }
      services.AddDbContext<TrainingContext>(options =>
      {
        options.EnableSensitiveDataLogging();
        configureDbAction(options);
      });
      return configureDbAction;
    }

    private void InitializeDatabase<T>(IApplicationBuilder app) where T : DbContext {
      using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
      {
        bool needTables = false;

        var dbContext = serviceScope.ServiceProvider.GetRequiredService<T>();
        var database = dbContext.Database;
            Console.WriteLine("MYMYMYMYMY useMigrations: " + useMigrations);

        if (useMigrations)
        {
          // Common case - SQL Server, etc
          database.Migrate();
        }
        else
        {
          // Dev / Sqlite database
          var migrates = database.GetMigrations();
          var creator = database.GetService<IRelationalDatabaseCreator>();
          if (!creator.Exists())
          {
            creator.Create();
            needTables = true;
          }

          Console.WriteLine("MYMYMYMYMY Need tables: " + needTables);
          if (needTables)
          {
            creator.CreateTables();
          }
        }
      }
    }
  }
}
