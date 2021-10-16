using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Kcesar.TrainingSite.Models
{
  public class ApiListResponse<T>
  {
    public List<T> Items { get; set; }
  }
}
