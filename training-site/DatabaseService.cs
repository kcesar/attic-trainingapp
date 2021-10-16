using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using IdentityModel.Client;
using Kcesar.TrainingSite.Identity;
using Kcesar.TrainingSite.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace Kcesar.TrainingSite
{
  public class DatabaseService
  {
    const string TOKEN_CACHE_KEY = "database_token";
    private readonly IConfiguration config;
    private readonly IMemoryCache cache;

    public DatabaseService(IConfiguration config, IMemoryCache cache)
    {
      this.config = config;
      this.cache = cache;
    }

    public async Task<List<TrainingRecord>> GetCredits(string traineeDatabaseId)
    {
      string json = await (await GetClient()).GetStringAsync($"members/{traineeDatabaseId}/trainingrecords");
      List<TrainingRecord> result = JsonSerializer.Deserialize<ApiListResponse<TrainingRecord>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }).Items;
      return result;
    }

    private async Task<HttpClient> GetClient()
    {
      HttpClient client = new();
      
      string token = cache.Get(TOKEN_CACHE_KEY) as string;
      if (string.IsNullOrWhiteSpace(token))
      {
        var response = await client.RequestClientCredentialsTokenAsync(new ClientCredentialsTokenRequest
        {
          Address = $"{config["rosters:token_endpoint"]}",
          ClientId = config["rosters:client_id"],
          ClientSecret = config["rosters:client_secret"],
          Scope = "database-api acct-managers db-w-members messaging-api"
        });
        if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
        {
          token = response.AccessToken;
          cache.Set(TOKEN_CACHE_KEY, token, TimeSpan.FromSeconds(response.ExpiresIn - 30));
        }
        else
        {
          throw new HttpResponseException(500, "Could not connect to database server");
        }
      }

      client = new HttpClient();
      client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
      client.BaseAddress = new Uri(config["rosters:url"]);
      return client;
    }
  }
}
