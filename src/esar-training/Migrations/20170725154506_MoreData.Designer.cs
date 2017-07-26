using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Kcesar.Training.Website.Data;

namespace esartraining.Migrations
{
    [DbContext(typeof(TrainingContext))]
    [Migration("20170725154506_MoreData")]
    partial class MoreData
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.2")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Kcesar.Training.Website.Data.CourseOffering", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("Capacity");

                    b.Property<string>("CourseId");

                    b.Property<string>("CourseName");

                    b.Property<string>("Location");

                    b.Property<DateTimeOffset>("When");

                    b.HasKey("Id");

                    b.ToTable("Offerings");
                });

            modelBuilder.Entity("Kcesar.Training.Website.Data.CourseSignup", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTimeOffset>("Created");

                    b.Property<string>("Name");

                    b.Property<int>("OfferingId");

                    b.Property<bool>("OnWaitList");

                    b.Property<string>("User");

                    b.HasKey("Id");

                    b.HasIndex("OfferingId");

                    b.ToTable("Signups");
                });

            modelBuilder.Entity("Kcesar.Training.Website.Data.CourseSignup", b =>
                {
                    b.HasOne("Kcesar.Training.Website.Data.CourseOffering", "Offering")
                        .WithMany("Signups")
                        .HasForeignKey("OfferingId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
