using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

namespace esartraining.Migrations
{
    public partial class MoreData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Signups_Offerings_OfferingId",
                table: "Signups");

            migrationBuilder.AlterColumn<int>(
                name: "OfferingId",
                table: "Signups",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "OnWaitList",
                table: "Signups",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Offerings",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Signups_Offerings_OfferingId",
                table: "Signups",
                column: "OfferingId",
                principalTable: "Offerings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Signups_Offerings_OfferingId",
                table: "Signups");

            migrationBuilder.DropColumn(
                name: "OnWaitList",
                table: "Signups");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Offerings");

            migrationBuilder.AlterColumn<int>(
                name: "OfferingId",
                table: "Signups",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_Signups_Offerings_OfferingId",
                table: "Signups",
                column: "OfferingId",
                principalTable: "Offerings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
