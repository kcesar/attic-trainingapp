using System;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Authentication;
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
          .AddEnvironmentVariables();
      Configuration = builder.Build();
    }

    public IConfigurationRoot Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddAuthentication(
        options => options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme);

      services.AddSingleton(Configuration);

      // Add framework services.
      services.AddMvc();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
      loggerFactory
        .WithFilter(new FilterLoggerSettings
        {
            { "Microsoft", LogLevel.Warning },
            { "System", LogLevel.Warning }
        })
        .AddSerilog();

      var hostingEnvironment = app.ApplicationServices.GetService<IHostingEnvironment>();

      JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

      loggerFactory.AddConsole(Configuration.GetSection("Logging"));
      loggerFactory.AddDebug();

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

      app.UseStaticFiles();

      app.UseCookieAuthentication(new CookieAuthenticationOptions
      {
        AutomaticAuthenticate = true,
        AutomaticChallenge = true,
        LoginPath = new PathString("/login"),
        LogoutPath = new PathString("/logout")
      });

      var oidcOptions = new OpenIdConnectOptions("OIDC")
      {
        Authority = Configuration["auth:authority"],
        // TODO: dev switch
        RequireHttpsMetadata = false,
        ClientId = Configuration["auth:client_id"],
        AutomaticAuthenticate = false,
        AutomaticChallenge = false,
        ResponseType = "id_token token",
        CallbackPath = new PathString("/signin"),
        ClaimsIssuer = "OIDC",
        GetClaimsFromUserInfoEndpoint = true,
        Events = new OpenIdConnectEvents
        {
          //OnTokenValidated = async context =>
          //{
          //  HttpClient client = new HttpClient();
          //  client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", context.ProtocolMessage.AccessToken);
          //  var userinfo = await client.GetStringAsync(context.SecurityToken.Issuer + "/connect/userinfo");
            
          //  context.Ticket.Principal.Identities.First().AddClaim(new Claim("userinfo", userinfo));
          //},
          OnTicketReceived = context =>
          {
            // Get the ClaimsIdentity
            var identity = context.Principal.Identity as ClaimsIdentity;
            if (identity != null)
            {
              // Add the Name ClaimType. This is required if we want User.Identity.Name to actually return something!
              if (!context.Principal.HasClaim(c => c.Type == ClaimTypes.Name) &&
                  identity.HasClaim(c => c.Type == "name"))
                identity.AddClaim(new Claim(ClaimTypes.Name, identity.FindFirst("name").Value));
            }

            return Task.FromResult(0);
          }
        }
      };

      foreach (var scope in Configuration["auth:scopes"].Split(new[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries))
      {
        oidcOptions.Scope.Add(scope);
      }

      app.UseOpenIdConnectAuthentication(oidcOptions);

      app.UseMvc();

      // Listen for requests on the /login path, and issue a challenge to log in with the OIDC middleware
      app.Map("/login", builder =>
      {
        //var httpContextAccessor = app.ApplicationServices.GetRequiredService<IHttpContextAccessor>();
        builder.Run(async context =>
        {
          var target = context.Request.Query["ReturnUrl"].FirstOrDefault();
          if (string.IsNullOrWhiteSpace(target) || target[0] != '/')
          {
            target = (Configuration["ASPNETCORE_APPL_PATH"] ?? "/").ToLowerInvariant(); // httpContextAccessor.HttpContext.Request.PathBase;
          }
          // Return a challenge to invoke the Auth0 authentication scheme
          await context.Authentication.ChallengeAsync("OIDC", new AuthenticationProperties() { RedirectUri = target });
        });
      });

      // Listen for requests on the /logout path, and sign the user out
      app.Map("/logout", builder =>
      {
        builder.Run(async context =>
        {
          // Sign the user out of the authentication middleware (i.e. it will clear the Auth cookie)
          await context.Authentication.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

          // Redirect the user to the home page after signing out
          context.Response.Redirect("/");
        });
      });
    }
  }
}
