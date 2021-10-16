using System;

namespace Kcesar.TrainingSite.Models
{
  public class TrainingRecord
  {
    public string Id { get; set; }
    public DateTimeOffset Completed { get; set; }
    public NameIdPair Course { get; set; }
    public string EventId { get; set; }
    public string EventType { get; set; }
    public DateTimeOffset? Expires { get; set; }
    public bool FromRule { get; set; }
    public string Status { get; set; }
  }
}
