using System;
using System.ComponentModel.DataAnnotations.Schema;
using Kcesar.TrainingSite.Models;

namespace Kcesar.TrainingSite.Data
{
  public class CourseSignup
  {
    public int Id { get; set; }
    [Column("user")]
    public string MemberId { get; set; }
    
    public string Name { get; set; }
    public int OfferingId { get; set; }
    public bool OnWaitList { get; set; }

    [ForeignKey("OfferingId")]
    public CourseOffering Offering { get; set; }

    public DateTimeOffset Created { get; set; }

    public bool CapApplies { get; set; } = true;

    public bool Deleted { get; set; } = false;
  }
}
