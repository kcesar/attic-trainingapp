using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Kcesar.Training.Website.Controllers
{
  public class BaseController : Microsoft.AspNetCore.Mvc.Controller
  {
    protected readonly IConfigurationRoot _config;
    protected readonly ILogger _logger;

    protected BaseController(IConfigurationRoot config, ILogger logger)
    {
      _config = config;
      _logger = logger;
    }

    protected async Task<string> AuthenticatedPostAsync(string endpoint, string scope, object postBody)
    {
      return await BearerPostAsync(endpoint, await GetTokenAsync(scope), postBody);
    }

    protected async Task<string> BearerPostAsync(string endpoint, string token, object postBody)
    {
      if (string.IsNullOrWhiteSpace(endpoint)) throw new ArgumentNullException(nameof(endpoint));
      if (postBody == null) throw new ArgumentNullException(nameof(postBody));
      // Create an account for the member

      var client = new HttpClient();
      client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
      var response = await client.PostAsync(endpoint, new StringContent(JsonConvert.SerializeObject(postBody), Encoding.UTF8, "application/json"));
      var responseJson = await response.Content.ReadAsStringAsync();
      if (!response.IsSuccessStatusCode)
      {
        throw new Exception(responseJson);
      }

      return responseJson;
    }
    protected async Task<string> BearerGetAsync(string endpoint, string token)
    {
      if (string.IsNullOrWhiteSpace(endpoint)) throw new ArgumentNullException(nameof(endpoint));
      var client = new HttpClient();
      client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
      var response = await client.GetAsync(endpoint);
      var responseJson = await response.Content.ReadAsStringAsync();
      if (!response.IsSuccessStatusCode)
      {
        throw new Exception(responseJson);
      }

      return responseJson;
    }

    protected async Task<string> GetTokenAsync(string scope)
    {
      if (string.IsNullOrWhiteSpace(scope)) throw new ArgumentNullException(nameof(scope));

      var client = new HttpClient();
      var httpArgs = new Dictionary<string, string>
        {
          { "grant_type", "client_credentials" },
          { "client_id", _config["apis:backend:client_id"] },
          { "client_secret", _config["apis:backend:client_secret"] },
          { "scope", scope }
        };
      var httpBody = new FormUrlEncodedContent(httpArgs);
      var response = await client.PostAsync(_config["auth:authority"].TrimEnd('/') + "/connect/token", httpBody);
      var responseJson = await response.Content.ReadAsStringAsync();
      if (!response.IsSuccessStatusCode)
      {
        throw new Exception(responseJson);
      }
      var tokenSet = JsonConvert.DeserializeObject<JObject>(responseJson);
      return tokenSet["access_token"].Value<string>();
    }
  }
}
