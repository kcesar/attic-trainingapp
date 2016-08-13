using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Kcesar.Training.Website.Models
{
  // {"first":"George","last":"Tester","email":"george@example.com","username":"mcosand2","password":"blahblah","passwordConfirm":"blahblah","middle":"middle","birthdate":"2017-05-01T07:00:00.000Z","gender":"m"}
  public class SignupDetails
  {
    public string First { get; set; }
    public string Last { get; set; }
    public string Middle { get; set; }
    public string Email { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public DateTimeOffset BirthDate { get; set; }
    public string Gender { get; set; }
  }
}
