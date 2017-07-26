using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kcesar.Training.Website.Data
{
  public class CourseSignup
  {
    public int Id { get; set; }
    public string User { get; set; }
    public string Name { get; set; }
    public int OfferingId { get; set; }
    public bool OnWaitList { get; set; }

    [ForeignKey("OfferingId")]
    public CourseOffering Offering { get; set; }

    public DateTimeOffset Created { get; set; }
  }
}
