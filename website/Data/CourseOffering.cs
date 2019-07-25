using System;
using System.Collections.Generic;

namespace Kcesar.Training.Website.Data
{
  public class CourseOffering
  {
    public int Id { get; set; }
    public string CourseName { get; set; }
    public DateTimeOffset When { get; set; }
    public int Capacity { get; set; }
    public IList<CourseSignup> Signups { get; set; } = new List<CourseSignup>();
    public string Location { get; set; }
  }
}
