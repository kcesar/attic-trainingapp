using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Kcesar.Training.Website.Controllers
{
  public class HomeController : BaseController
  {
    private readonly string _webRoot;

    public HomeController(IConfigurationRoot config, ILogger<HomeController> logger, IHostingEnvironment env) : base(config, logger)
    {
      _webRoot = env.WebRootPath;
    }

    static string reactHtml = null;
    static object reactLock = new object();
    string GetReactHtml()
    {
      if (reactHtml == null)
      {
        lock (reactLock)
        {
          if (reactHtml == null)
          {
            var authConfig = JsonConvert.SerializeObject(new
            {
              authority = _config["auth:authority"]
            });
            var config = JsonConvert.SerializeObject(new
            {
              localRoot = "",
              remoteRoot = _config["apis:database"],
              authRoot = _config["apis:accounts"]
            });

            reactHtml = System.IO.File.ReadAllText(Path.Combine(_webRoot, "index.html")).Replace("<head>", $"<head>" +
              $"<base href=\"{_config["baseUrl"] ?? Url.Content("~/")}\"/>" +
              $"<script>window.baseUrl = \"{Url.Content("~/")}\";" +
              $"window.siteAuth = {authConfig};" +
              $"window.siteConfig = {config};</script>");
          }
        }
      }
      return reactHtml;
    }

    //[HttpGet("")]
    //[HttpGet("me")]
    //[HttpGet("loggedIn")]
    //[HttpGet("admin/{*path}")]
    //public IActionResult React()
    //{
    //  return Content(GetReactHtml(), "text/html");
    //}
  }
}
