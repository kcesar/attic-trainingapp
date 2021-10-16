using System;
using System.Linq;
using System.Threading.Tasks;
using IdentityModel;
using Kcesar.TrainingSite.Data;
using Kcesar.TrainingSite.Identity;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Kcesar.TrainingSite
{
  public class Startup
  {
    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      //services.AddSingleton(Configuration);
      services.AddSingleton(new LeversAndKnobs
      {
        CanRegister = Configuration.GetValue<bool>("openRegistration")
      });

      if (!string.IsNullOrWhiteSpace(Configuration.GetConnectionString(SqlServerApplicationDbContext.CONNECTION_STRING_KEY)) && Configuration.GetValue("Provider", "SqlServer") == "SqlServer")
      {
        Console.WriteLine("Starting with SQL Server");
        services.AddDbContext<ApplicationDbContext, SqlServerApplicationDbContext>();
        FinishSetup<SqlServerApplicationDbContext>(services);
      }
      else
      {
        Console.WriteLine("Starting with SQLite");
        services.AddDbContext<ApplicationDbContext>();
        FinishSetup<ApplicationDbContext>(services);
      }
    }

    private void FinishSetup<ContextType>(IServiceCollection services) where ContextType : ApplicationDbContext
    {
      services.AddDefaultIdentity<ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
          .AddUserManager<AppUserManager>()
          .AddRoles<IdentityRole>()
          .AddClaimsPrincipalFactory<UserClaimsFactory>()
          .AddEntityFrameworkStores<ContextType>();

      services.AddDatabaseDeveloperPageExceptionFilter();

      services.AddIdentityServer()
        .AddApiAuthorization<ApplicationUser, ContextType>(options =>
        {
          var profile = options.IdentityResources.Single(f => f.Name == "profile");
          profile.UserClaims.Add(JwtClaimTypes.Role);
        });

      services.AddScoped<SignInManager<ApplicationUser>, OrgSigninManager>();
      services.AddScoped<AuthorizationService>();
      services.AddSingleton<DatabaseService>();

      services.AddAuthentication()
          .AddGoogle("google", "Google", options =>
          {
            options.ClientId = Configuration["auth:google:client_id"];
            options.ClientSecret = Configuration["auth:google:client_secret"];
            options.ClaimActions.MapJsonKey("domain", "hd", "string");
            options.AuthorizationEndpoint += "?prompt=select_account";
            if (!string.IsNullOrWhiteSpace(Configuration["auth:google:domains"]))
            {
              options.AuthorizationEndpoint += "&hd=" + System.Net.WebUtility.UrlEncode(Configuration["auth:google:domains"]);
            }
          })
          .AddIdentityServerJwt();

      services.AddControllersWithViews(options =>
      {
        options.Filters.Add(new HttpResponseExceptionFilter());
      });
      services.AddRazorPages();

      // In production, the React files will be served from this directory
      services.AddSpaStaticFiles(configuration =>
      {
        configuration.RootPath = "ClientApp/build";
      });
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
        app.UseMigrationsEndPoint();
      }
      else
      {
        app.UseExceptionHandler("/Error");
        // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
        app.UseHsts();
      }

      app.UseHttpsRedirection();
      app.UseStaticFiles();
      app.UseSpaStaticFiles();

      app.UseRouting();

      app.UseAuthentication();
      app.UseIdentityServer();
      app.UseAuthorization();
      app.UseEndpoints(endpoints =>
      {
        endpoints.MapControllerRoute(
                  name: "default",
                  pattern: "{controller}/{action=Index}/{id?}");
        endpoints.MapRazorPages();
      });

      app.UseSpa(spa =>
      {
        spa.Options.SourcePath = "ClientApp";

        if (env.IsDevelopment())
        {
          spa.UseReactDevelopmentServer(npmScript: "start");
        }
      });
    }
  }
}
