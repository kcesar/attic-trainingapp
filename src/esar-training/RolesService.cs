﻿using System;
using System.Collections.Generic;
using System.Net.Http;
using IdentityModel.Client;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
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

    public RolesService(IConfigurationRoot config, IMemoryCache cache)
    {
      authority = config["auth:authority"].Trim('/');
      clientId = config["apis:client_id"];
      clientSecret = config["apis:client_secret"];
      url = config["apis:accounts"];
      scope = config["apis:scope"];
      this.cache = cache;
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
      var json = http.GetStringAsync(authority + $"/Account/{accountId}/Groups").Result;
      var payload = JsonConvert.DeserializeObject<JObject>(json);

      var list = payload["data"].ToObject<List<string>>();
      lock (cache)
      {
        cache.Set(accountId.ToString(), list, TimeSpan.FromMinutes(5));
      }
      return list;
    }
  }
}