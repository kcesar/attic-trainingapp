using System;
using System.Collections.Generic;
using System.Net.Http;
using IdentityModel.Client;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Kcesar.Training.Website
{
  public class RolesService
  {
    private readonly string authority;
    private readonly string clientId;
    private readonly string clientSecret;
    private readonly string url;
    private readonly string scope;
    private readonly IMemoryCache cache;
    private readonly ILogger<RolesService> logger;

    public RolesService(IConfigurationRoot config, IMemoryCache cache, ILogger<RolesService> logger)
    {
      authority = config["auth:authority"].Trim('/');
      clientId = config["apis:client_id"];
      clientSecret = config["apis:client_secret"];
      url = config["apis:accounts"];
      scope = config["apis:scopes"];

      logger.LogInformation($"Service started. Will query {url} using token from {authority} (client_id={clientId}, scopes={scope})");
      if (string.IsNullOrWhiteSpace(scope)) logger.LogError("apis:scopes configuration is empty");
      this.cache = cache;
      this.logger = logger;
    }


    public List<string> ListAllRolesForAccount(Guid accountId)
    {
      lock (cache)
      {
        var cached = (List<string>)cache.Get(accountId.ToString());
        if (cached != null) return cached;
      }

      TokenClient client = new TokenClient(authority + "/connect/token", clientId, clientSecret, style: AuthenticationStyle.PostValues);
      var token = client.RequestClientCredentialsAsync(scope).Result;

      var http = new HttpClient();
      http.SetBearerToken(token.AccessToken);

      string json;
      try
      {
        json = http.GetStringAsync(authority + $"/Account/{accountId}/Groups").Result;
      }
      catch (Exception e)
      {
        logger.LogError(e, "Failed to get groups. My access token: " + token.AccessToken);
        throw new InvalidOperationException("Failed to get group membership");
      }

      JObject payload;
      try
      {
        payload = JsonConvert.DeserializeObject<JObject>(json);
      }
      catch (Exception e)
      {
        logger.LogError(e, "Failed to parse response: " + json);
        throw new InvalidOperationException("Failed to parse group membership");
      }

      var list = payload["data"].ToObject<List<string>>();
      lock (cache)
      {
        cache.Set(accountId.ToString(), list, TimeSpan.FromMinutes(5));
      }
      return list;
    }
  }
}
