using System;
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;

namespace esar_training
{
  public class Program
  {
    public static void Main(string[] args)
    {
      Console.WriteLine("ESAR training site " + System.Diagnostics.Process.GetCurrentProcess().Id);
      Console.Title = $"ESAR training {System.Diagnostics.Process.GetCurrentProcess().Id}";
      BuildWebHost(args).Run();
    }

    public static IWebHost BuildWebHost(string[] args)
    {
      var builder = WebHost.CreateDefaultBuilder(args);
      var insightsKey = Environment.GetEnvironmentVariable("APPINSIGHTS_INSTRUMENTATIONKEY");
      if (!string.IsNullOrWhiteSpace(insightsKey))
      {
        builder = builder.UseApplicationInsights(insightsKey);
      }

      string contentRoot = "";

      return builder
        .UseStartup<Startup>()
        .ConfigureAppConfiguration((context, config) =>
        {
          config.AddJsonFile("appsettings.json", true, true)
                   .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", true, true)
                   .AddJsonFile("appsettings.local.json", true, true)
                   .AddEnvironmentVariables();

          contentRoot = context.HostingEnvironment.ContentRootPath;
        })
        .ConfigureLogging(logBuilder =>
        {
          Log.Logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.RollingFile(Path.Combine(contentRoot, "log-{Date}.txt"), restrictedToMinimumLevel: LogEventLevel.Information)
            .CreateLogger();

          logBuilder
            .AddSerilog()
            .AddApplicationInsights();
        })
        .Build();
    }
  }
}
