using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyTuyenDung.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Candidate_CandidateID",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Job_JobID",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Job_Users_PostedBy",
                table: "Job");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Job",
                table: "Job");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Candidate",
                table: "Candidate");

            migrationBuilder.RenameTable(
                name: "Job",
                newName: "Jobs");

            migrationBuilder.RenameTable(
                name: "Candidate",
                newName: "Candidates");

            migrationBuilder.RenameIndex(
                name: "IX_Job_PostedBy",
                table: "Jobs",
                newName: "IX_Jobs_PostedBy");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Jobs",
                table: "Jobs",
                column: "JobID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Candidates",
                table: "Candidates",
                column: "CandidateID");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Candidates_CandidateID",
                table: "Applications",
                column: "CandidateID",
                principalTable: "Candidates",
                principalColumn: "CandidateID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Jobs_JobID",
                table: "Applications",
                column: "JobID",
                principalTable: "Jobs",
                principalColumn: "JobID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_Users_PostedBy",
                table: "Jobs",
                column: "PostedBy",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Candidates_CandidateID",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Applications_Jobs_JobID",
                table: "Applications");

            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_Users_PostedBy",
                table: "Jobs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Jobs",
                table: "Jobs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Candidates",
                table: "Candidates");

            migrationBuilder.RenameTable(
                name: "Jobs",
                newName: "Job");

            migrationBuilder.RenameTable(
                name: "Candidates",
                newName: "Candidate");

            migrationBuilder.RenameIndex(
                name: "IX_Jobs_PostedBy",
                table: "Job",
                newName: "IX_Job_PostedBy");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Job",
                table: "Job",
                column: "JobID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Candidate",
                table: "Candidate",
                column: "CandidateID");

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Candidate_CandidateID",
                table: "Applications",
                column: "CandidateID",
                principalTable: "Candidate",
                principalColumn: "CandidateID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Applications_Job_JobID",
                table: "Applications",
                column: "JobID",
                principalTable: "Job",
                principalColumn: "JobID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Job_Users_PostedBy",
                table: "Job",
                column: "PostedBy",
                principalTable: "Users",
                principalColumn: "UserID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
