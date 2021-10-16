using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Kcesar.TrainingSite.Controllers
{
  public class ConfigController : Controller
  {
    private readonly LeversAndKnobs levers;
    private readonly ILogger<ConfigController> _logger;

    public ConfigController(LeversAndKnobs levers, IClientRequestParametersProvider clientRequestParametersProvider, ILogger<ConfigController> logger)
    {
      this.levers = levers;
      ClientRequestParametersProvider = clientRequestParametersProvider;
      _logger = logger;
    }
    
    public IClientRequestParametersProvider ClientRequestParametersProvider { get; }

    [HttpGet("_configuration/site")]
    public LeversAndKnobs GetSiteConfig()
    {
      return levers;
    }

    [HttpGet("_configuration/{clientId}")]
    public IActionResult GetClientRequestParameters([FromRoute] string clientId)
    {
      var parameters = ClientRequestParametersProvider.GetClientParameters(HttpContext, clientId);
      return Ok(parameters);
    }
  }
}
