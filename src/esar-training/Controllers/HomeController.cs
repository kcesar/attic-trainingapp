using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Kcesar.Training.Website.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Kcesar.Training.Website.Controllers
{
  public class HomeController : Controller
  {
    private readonly IConfigurationRoot _config;
    private readonly ILogger _logger;

    public HomeController(IConfigurationRoot config, ILogger<HomeController> logger)
    {
      _config = config;
      _logger = logger;
    }

    [HttpGet("")]
    public IActionResult Index()
    {
      return View();
    }

    [HttpGet("me")]
    public IActionResult Dashboard()
    {
      return View();
    }


    [HttpGet("signup")]
    public IActionResult Signup()
    {
      ViewData["Message"] = "Your application description page.";

      return View();
    }

    [HttpPost("signup")]
    public async Task<object> Signup([FromBody] SignupDetails details)
    {
      _logger.LogInformation(JsonConvert.SerializeObject(details));

      if (string.IsNullOrWhiteSpace(details.First)) throw new ArgumentException("first name is required");
      if (string.IsNullOrWhiteSpace(details.Last)) throw new ArgumentException("last name is required");
      if (string.IsNullOrWhiteSpace(details.Username)) throw new ArgumentException("username is required");
      if (string.IsNullOrWhiteSpace(details.Password)) throw new ArgumentException("password is required");
      if (string.IsNullOrWhiteSpace(details.Email)) throw new ArgumentException("email is required");
      if (details.BirthDate < DateTimeOffset.Now.AddYears(-100) || details.BirthDate > DateTime.Now.AddYears(-10))
        throw new ArgumentException("birthdate is out of range");

      // Get an access token for training app -> database
      var responseJson = await AuthenticatedPostAsync(
        _config["apis:accounts:root"].TrimEnd('/') + "/provision",
        _config["apis:accounts:scopes"],
        new
        {
          Username = details.Username,
          FirstName = details.First,
          LastName = details.Last,
          Email = details.Email,
          Password = details.Password
        });

      var dbToken = await GetTokenAsync(_config["apis:database:scopes"]);
      var apiRoot = _config["apis:database:root"].TrimEnd('/');

      // Create the member in the database
      responseJson = await BearerPostAsync(
         $"{apiRoot}/members",
        dbToken,
        new
        {
          First = details.First,
          Middle = details.Middle,
          Last = details.Last,
          Gender = (details.Gender == "male" || details.Gender == "female") ? details.Gender : "unknown",
          WacLevel = "Novice",
          WacLevelDate = DateTime.Now,
          BirthDate = details.BirthDate.LocalDateTime
        });
      var response = JsonConvert.DeserializeObject<JObject>(responseJson);

      var memberId = response["id"].Value<string>();


      // Link the new member with their account
      responseJson = await AuthenticatedPostAsync(
        _config["apis:accounts:root"].TrimEnd('/') + "/linkmember",
        _config["apis:accounts:scopes"],
        new
        {
          Username = details.Username,
          MemberId = memberId
        });

      // Save the email
      responseJson = await BearerPostAsync(
        $"{apiRoot}/members/{memberId}/contacts",
        dbToken,
        new
        {
          Type = "email",
          Value = details.Email
        });

      // Mark them as trainee with the unit
      responseJson = await BearerPostAsync(
        $"{apiRoot}/members/{memberId}/memberships",
        dbToken,
        new
        {
          Unit = new { Id = new Guid(_config["unit_id"]) },
          Status = _config["new_member_status"],
          Start = DateTime.Now
        });

      //client.PostAsync()
//      throw new Exception("Shouldn't work yet");
      return new { status = "OK" };
    }

    private async Task<string> AuthenticatedPostAsync(string endpoint, string scope, object postBody)
    {
      return await BearerPostAsync(endpoint, await GetTokenAsync(scope), postBody);
    }

    private async Task<string> BearerPostAsync(string endpoint, string token, object postBody)
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

    private async Task<string> GetTokenAsync(string scope)
    {
      if (string.IsNullOrWhiteSpace(scope)) throw new ArgumentNullException(nameof(scope));

      var client = new HttpClient();
      var httpArgs = new Dictionary<string, string>
        {
          { "grant_type", "client_credentials" },
          { "client_id", _config["apis:client_id"] },
          { "client_secret", _config["apis:client_secret"] },
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

    [HttpGet("home/error")]
    public IActionResult Error()
    {
      return View();
    }
  }
}
