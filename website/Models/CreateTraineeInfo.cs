using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Kcesar.Training.Website.Models
{
  public class CreateTraineeInfo
  {
    public string First { get; set; }
    public string Last { get; set; }
    public string Middle { get; set; }
    public DateTime BirthDate { get; set; }
    public string Gender { get; set; }
  }
}
