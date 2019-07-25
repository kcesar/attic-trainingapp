using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Kcesar.Training.Website.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "trainingapp");

            migrationBuilder.CreateTable(
                name: "Offerings",
                schema: "trainingapp",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Capacity = table.Column<int>(nullable: false),
                    CourseName = table.Column<string>(nullable: true),
                    Location = table.Column<string>(nullable: true),
                    When = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offerings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Signups",
                schema: "trainingapp",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Created = table.Column<DateTimeOffset>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    OfferingId = table.Column<int>(nullable: false),
                    OnWaitList = table.Column<bool>(nullable: false),
                    User = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Signups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Signups_Offerings_OfferingId",
                        column: x => x.OfferingId,
                        principalSchema: "trainingapp",
                        principalTable: "Offerings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Signups_OfferingId",
                schema: "trainingapp",
                table: "Signups",
                column: "OfferingId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Signups",
                schema: "trainingapp");

            migrationBuilder.DropTable(
                name: "Offerings",
                schema: "trainingapp");
        }
    }
}
