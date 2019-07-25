using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Kcesar.Training.Website.Migrations
{
    public partial class CapApplies : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "User",
                schema: "trainingapp",
                table: "Signups",
                newName: "user");

            migrationBuilder.AddColumn<bool>(
                name: "CapApplies",
                schema: "trainingapp",
                table: "Signups",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CapApplies",
                schema: "trainingapp",
                table: "Signups");

            migrationBuilder.RenameColumn(
                name: "user",
                schema: "trainingapp",
                table: "Signups",
                newName: "User");
        }
    }
}
