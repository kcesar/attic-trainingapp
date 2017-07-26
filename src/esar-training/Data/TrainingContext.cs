using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Kcesar.Training.Website.Data
{
  public class TrainingContext : DbContext
  {
    public TrainingContext(DbContextOptions<TrainingContext> options)
            : base(options)
        { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);
      modelBuilder.HasDefaultSchema("trainingapp");
    }

    public DbSet<CourseOffering> Offerings { get; set; }
    public DbSet<CourseSignup> Signups { get; set; }
  }
}
