using System;
using System.Linq;
using System.Threading.Tasks;
using Kcesar.Training.Website.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Kcesar.Training.Website.Models;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace Kcesar.Training.Website.Controllers
{
  [Authorize]
  public class TraineesController : BaseController
  {
    private readonly TrainingContext _db;
    private readonly RolesService rolesSvc;

    public TraineesController(TrainingContext db, RolesService rolesSvc, IConfigurationRoot config, ILogger<TraineesController> logger) : base(config, logger)
    {
      _db = db;
      this.rolesSvc = rolesSvc;
    }

    [HttpPost("/api/trainees")]
    public async Task<object> CreateTrainee([FromBody] CreateTraineeInfo details)
    {
      _logger.LogInformation($"User {User.FindFirst(ClaimTypes.NameIdentifier)?.Value} is trying to create user {JsonConvert.SerializeObject(details)}");
      var roles = rolesSvc.ListAllRolesForAccount(new Guid(User.FindFirst(ClaimTypes.NameIdentifier).Value));
      if (!roles.Contains("esar.training.admin")) return Forbid();

      if (string.IsNullOrWhiteSpace(details.First)) throw new ArgumentException("first name is required");
      if (string.IsNullOrWhiteSpace(details.Last)) throw new ArgumentException("last name is required");
      if (details.BirthDate < DateTimeOffset.Now.AddYears(-100) || details.BirthDate > DateTime.Now.AddYears(-10))
        throw new ArgumentException("birthdate is out of range");

      var dbToken = await GetTokenAsync(_config["apis:scopes"]);
      var apiRoot = _config["apis:database"].TrimEnd('/');

      // Create the member in the database
      var responseJson = await BearerPostAsync(
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
          BirthDate = details.BirthDate.Date
        });
      var response = JsonConvert.DeserializeObject<JObject>(responseJson);

      var memberId = response["id"].Value<string>();

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

      _logger.LogInformation("in the function");
      _logger.LogInformation(JsonConvert.SerializeObject(details));
      return new
      {
        MemberId = memberId,
        Name = $"{details.First} {details.Last}"
      };
    }

    [HttpPost("/api/trainees/{memberId}/invite")]
    public async Task<object> Invite(string memberId, [FromQuery] string username) {
      var token = await GetTokenAsync(_config["apis:scopes"]);

      var responseJson = await BearerGetAsync(
        $"{_config["apis:accounts"].TrimEnd('/')}/account/formember/{memberId}",
        token
      );

      var accountData = (JArray)JsonConvert.DeserializeObject<JObject>(responseJson).SelectToken("data");
      if (accountData.Count == 0)
      {
        return BadRequest(new { Error = new { Message = "Member does not have an account" }});
      }

      JObject account = null;
      if (string.IsNullOrWhiteSpace(username)) {
        if (accountData.Count > 1) {
          return BadRequest(new { Error = new { Message = "Member has multiple accounts. Use 'username' query parameter to specify."}});
        }
        account = (JObject)accountData[0];
      }
      else
      {
        foreach (JObject data in accountData) {
          if (username.Equals(data.Value<string>("username"), StringComparison.OrdinalIgnoreCase)) {
            account = data;
            break;
          }
        }
        if (account == null) {
          return BadRequest("Member does not have account with that username");
        }
      }
      var resetPasswordUrl = _config["auth:authority"].TrimEnd('/') + "/forgotpassword?username=" + account.Value<string>("username");
      string message = ("{name},<br/><br/><p><strong>Congratulations!</strong></p>" +
                        "<p>We're excited to invite you to be part of the 2019-2020 training class for King County Explorer Search and Rescue (KCESAR).</p>" +
                        "<p><strong>Next steps</strong></p>" +
                        "<ol><li>Check your calendar to ensure you can commit to at least one date for each training course: <a href=\"http://kcesar.org/recruiting.html\">http://kcesar.org/recruiting.html</a>. If you’re unable to attend any of the offerings for each course, you must wait until 2020-2021.</li>" +
                        $"<li>In order to track your progress through the program and register for courses, please use the training portal at <a href=\"https://training.kcesar.org\">https://training.kcesar.org</a>. An account for this system has been created for you with username \"{username}\". You can set the password for this account after visiting the password reset page at <a href=\"{resetPasswordUrl}\">{resetPasswordUrl}</a>.</li></ol>" +
                        "<p>We encourage new members who have successfully completed training to participate in as many missions as possible during their first year in the unit. If this will present a challenge, we recommend waiting to attend training until this will be feasible. Training is offered annually.</p>" +
                        "<p>If you have any questions, contact us at <a href=\"mailto:training.admin@kcesar.org\">training.admin@kcesar.org</a>.</p>" +
                        "<p>See you at Course A!</p>" +
                        "<p>The KCESAR Training team</p>")
            .Replace("{username}", account.Value<string>("username"))
            .Replace("{name}", account.Value<string>("name"));

      responseJson = await BearerPostAsync(
        $"{_config["apis:messaging"].TrimEnd('/')}/send/email",
        token,
        new {
          To = account.Value<string>("email"),
          Subject = "Welcome to ESAR basic training",
          Message = message
        }
      );

      return new {
        Success = true
      };
    }
/*
    class OfferingWithCounts
    {
      public CourseOffering O { get; set; }
      public int Current { get; set; }
      public int Waiting { get; set; }
    }

    private IQueryable<OfferingWithCounts> GetOfferingsQuery(IQueryable<CourseOffering> source)
    {
      return source.Select(f => new OfferingWithCounts { O = f, Current = f.Signups.Where(g => !g.OnWaitList && g.CapApplies && !g.Deleted).Count(), Waiting = f.Signups.Where(g => g.OnWaitList && !g.Deleted).Count() });
    }


    [AllowAnonymous]
    [HttpGet("/api/schedule")]
    public async Task<object> Get()
    {
      var sessions = await GetOfferingsQuery(_db.Offerings.AsNoTracking()).ToListAsync();
      return TransformSessionList(sessions, null);
    }

    [HttpGet("/api/schedule/{memberId}")]
    public async Task<object> GetForMember(string memberId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isMember = User.FindFirst(f => f.Type == "role" && f.Value == "sec.esar.members") != null;

      if (!isMember && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't see other persons schedule");

      memberId = memberId ?? User.FindFirst("memberId").Value;

      var sessions = await GetOfferingsQuery(_db.Offerings.AsNoTracking()).ToListAsync();
      var signups = await _db.Signups.AsNoTracking().Where(f => f.MemberId == memberId && !f.Deleted).ToListAsync();

      return TransformSessionList(sessions, signups);
    }

    private static object TransformSessionList(List<OfferingWithCounts> sessions, List<CourseSignup> signups)
    {
      return new
      {
        Items = sessions.GroupBy(f => f.O.CourseName, f => f).ToDictionary(g => g.Key, g => g.OrderBy(f => f.O.When).Select(f =>
        (object)new
        {
          Id = f.O.Id,
          When = f.O.When,
          Location = f.O.Location,
          Capacity = f.O.Capacity,
          Current = Math.Min(f.Current, f.O.Capacity),
          Waiting = f.Waiting,
          Registered = signups == null ? null : signups.Where(h => h.OfferingId == f.O.Id).Select(h => h.OnWaitList ? "wait" : "yes").FirstOrDefault() ?? "no"
        }).ToArray())
      };
    }

    [HttpPost("/api/schedule/{memberId}/session/{sessionId}")]
    public async Task<object> Register(string memberId, int sessionId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isAdmin = User.FindFirst(f => f.Type == "role" && f.Value == "esar.training") != null;
      if (!isAdmin && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't change other persons schedule");

      var offer = await GetOfferingsQuery(_db.Offerings.AsNoTracking().Where(f => f.Id == sessionId)).SingleOrDefaultAsync();
      if (offer == null) throw new Exception("Session not found");
      var existing = await _db.Signups.AsNoTracking().Where(f => f.MemberId == memberId && f.Offering.CourseName == offer.O.CourseName && !f.Deleted).ToListAsync();

      if (existing.Any(f => f.OfferingId == sessionId)) throw new Exception("Already registered for this session");

      bool isWaitList = offer.Waiting > 0 || offer.Current >= offer.O.Capacity;

      _db.Signups.Add(new CourseSignup
      {
        Created = DateTimeOffset.UtcNow,
        MemberId = memberId,
        Name = "",
        OfferingId = sessionId,
        OnWaitList = isWaitList
      });
      await _db.SaveChangesAsync();

      return GetForMember(memberId);
    }

    [HttpDelete("/api/schedule/{memberId}/session/{sessionId}")]
    public async Task<object> Leave(string memberId, int sessionId)
    {
      string userMemberId = User.FindFirst("memberId").Value;
      bool isAdmin = User.FindFirst(f => f.Type == "role" && f.Value == "esar.training") != null;
      if (!isAdmin && !string.Equals(userMemberId, memberId, StringComparison.OrdinalIgnoreCase)) throw new Exception("user can't change other persons schedule");

      var offer = await GetOfferingsQuery(_db.Offerings.AsNoTracking().Where(f => f.Id == sessionId)).SingleOrDefaultAsync();
      if (offer == null) throw new Exception("Session not found");

      var existing = await _db.Signups.Where(f => f.MemberId == memberId && f.Offering.Id == sessionId && !f.Deleted).FirstOrDefaultAsync();
      if (existing == null) throw new Exception("Signup not found");

      existing.Deleted = true;
      await _db.SaveChangesAsync();


      return GetForMember(memberId);
    }
    */
  }
}
