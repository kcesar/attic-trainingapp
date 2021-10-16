using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Kcesar.TrainingSite.Data;
using Kcesar.TrainingSite.Identity;
using Kcesar.TrainingSite.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Kcesar.TrainingSite.Controllers
{
  [Authorize]
  [Route("/api/trainees")]
  public class TraineesController : Controller
  {
    private readonly AuthorizationService authz;
    private readonly AppUserManager users;
    private readonly DatabaseService databaseApi;
    private readonly ApplicationDbContext db;

    public TraineesController(AuthorizationService authz, AppUserManager users, DatabaseService databaseApi, ApplicationDbContext db)
    {
      this.authz = authz;
      this.users = users;
      this.databaseApi = databaseApi;
      this.db = db;
    }

    [HttpGet("/api/trainees/{traineeId}")]
    public async Task<NameIdPair> GetTrainee(string traineeId)
    {
      await authz.AssertIsMemberOrSelf(User, traineeId);

      var user = await users.FindByIdAsync(traineeId);
      if (user == null || string.IsNullOrWhiteSpace(user.DatabaseId))
      {
        throw new HttpResponseException(404, "Not found");
      }

      string name;
      if (string.IsNullOrWhiteSpace(user.FirstName))
      {
        name = user.Email;
      }
      else
      {
        name = string.IsNullOrWhiteSpace(user.LastName) ? user.FirstName : (user.FirstName + " " + user.LastName);
      }

      return new NameIdPair
      {
        Id = traineeId,
        Name = name
      };
    }

    [HttpGet("{traineeId}/completed")]
    public async Task<ApiListResponse<TrainingRecord>> GetTraineeRecords(string traineeId)
    {
      var user = await users.FindByIdAsync(traineeId);
      if (user == null) throw new HttpResponseException(404, "Not found");
      if (string.IsNullOrWhiteSpace(user.DatabaseId)) throw new HttpResponseException(500, "Trainee does not have a database ID.");

      var records = await databaseApi.GetCredits(user.DatabaseId);
      return new ApiListResponse<TrainingRecord>
      {
        Items = records
      };
    }
  }
}
