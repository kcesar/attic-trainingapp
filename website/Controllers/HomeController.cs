using System.Security.Claims;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Kcesar.Training.Website.Controllers
{
  public class HomeController : BaseController
  {
    private readonly string _webRoot;

    public HomeController(IConfigurationRoot config, ILogger<HomeController> logger, IHostingEnvironment env) : base(config, logger)
    {
      _webRoot = env.WebRootPath;
    }

    [HttpGet("/react-config")]
    public IActionResult ReactConfig([FromServices] IConfiguration config)
    {
      object me = null;
      object oidc = null;
      if (User.Identity.IsAuthenticated)
      {
        string userId = User.FindFirstValue("sub");
        me = new
        {
          UserId = userId
        };
        oidc = new
        {
          User = new
          {
            Profile = new
            {
              Name = User.FindFirstValue("name"),
              Sub = userId
            }
          }
        };
      }

      return Content("window.reactConfig = " + JsonConvert.SerializeObject(new
      {
        auth = new
        {
          authority = config["auth:authority"],
          client_id = config["apis:frontend:client_id"]
        },
        apis = new
        {
          accounts = new
          {
            url = (config["apis:accounts"] ?? "").TrimEnd('/')
          },
          data = new
          {
            url = (config["apis:database"] ?? "").TrimEnd('/')
          }
        },
        me,
        oidc
      }, new JsonSerializerSettings() { ContractResolver = new CamelCasePropertyNamesContractResolver() }));
    }
  }
}
