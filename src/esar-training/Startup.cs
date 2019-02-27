using System.IO;
using IdentityServer4.AccessTokenValidation;
using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;

namespace esar_training
{
  public class Startup
  {
    public Startup(IHostingEnvironment env)
    {
      Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Debug()
        .WriteTo.RollingFile(Path.Combine(env.ContentRootPath, "log-{Date}.txt"))
        .CreateLogger();

      Log.Logger.Information($"Starting site. Environment: {env.EnvironmentName}");

      var builder = new ConfigurationBuilder()
          .SetBasePath(env.ContentRootPath)
          .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
          .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
          .AddJsonFile($"appsettings.local.json", optional: true)
          .AddEnvironmentVariables();
      Configuration = builder.Build();
    }

    public IConfigurationRoot Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddSingleton(Configuration);

      services.AddDbContext<TrainingContext>(options => options.UseSqlServer(Configuration["database"], o => o.MigrationsHistoryTable("__Migrations", "trainingapp")));

      // Add framework services.
      services.AddMvc();

      services.AddAuthentication("Bearer")
        .AddIdentityServerAuthentication(options =>
        {
          options.Authority = Configuration["auth:authority"];
          options.LegacyAudienceValidation = true;
          options.ApiName = "introspection";
          options.ApiSecret = Configuration["auth:introspection_key"];
          options.RequireHttpsMetadata = false;
        });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
      var hostingEnvironment = app.ApplicationServices.GetService<IHostingEnvironment>();

      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
        app.UseBrowserLink();
      }
      else
      {
        Log.Logger.Information("Inserting HTTPS redirect middleware");
        app.Use(async (context, next) =>
        {
          if (context.Request.IsHttps)
          {
            await next();
          }
          else
          {
            var withHttps = string.Format("https://{0}{1}", context.Request.Host, context.Request.PathBase);
            Log.Logger.Information($"Redirecting to {withHttps}");
            context.Response.Redirect(withHttps);
          }
        });

        app.UseExceptionHandler("/Home/Error");
      }

      app.UseAuthentication();
      app.UseStaticFiles();
      app.UseMvc();
    }
  }
}
