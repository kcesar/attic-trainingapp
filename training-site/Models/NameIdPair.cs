namespace Kcesar.TrainingSite.Models
{
  public class NameIdPair : NameIdPair<string> { }

  public class NameIdPair<T>
  {
    public T Id { get; set; }
    public string Name { get; set; }
  }
}
