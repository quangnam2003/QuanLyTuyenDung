using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using System.Text.Json;

namespace QuanLyTuyenDung.DBContext
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<Job> Jobs { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<JobOffer> JobOffers { get; set; }
        public DbSet<Recruiter> Recruiters { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<JobPost> JobPosts { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<JobApplicationStatus> JobApplicationStatuses { get; set; }
        public DbSet<UserNotification> Notifications { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Job Configuration
            modelBuilder.Entity<Job>(entity =>
            {
                entity.HasKey(e => e.JobID);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .IsRequired();

                entity.Property(e => e.Requirements)
                    .IsRequired();

                entity.Property(e => e.SalaryRange)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Company)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Department)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.ExperienceRequired)
                    .HasMaxLength(200);

                entity.Property(e => e.DetailedLocation)
                    .HasMaxLength(500);

                entity.Property(e => e.Education)
                    .HasMaxLength(200);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(100);

                entity.Property(e => e.UpdatedBy)
                    .HasMaxLength(100);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.PostedJobs)
                    .HasForeignKey(e => e.PostedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.CreatedAt);
            });

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserID);

                entity.Property(e => e.FullName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.PasswordHash)
                    .IsRequired();

                entity.Property(e => e.Role)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Phone)
                    .HasMaxLength(15);

                entity.Property(e => e.Avatar)
                    .HasMaxLength(500);

                entity.Property(e => e.Department)
                    .HasMaxLength(100);

                entity.Property(e => e.Position)
                    .HasMaxLength(100);

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.HasIndex(e => e.Role);
            });

            // Candidate Configuration
            modelBuilder.Entity<Candidate>(entity =>
            {
                entity.HasKey(e => e.CandidateID);

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Phone)
                    .IsRequired()
                    .HasMaxLength(15);

                entity.Property(e => e.Address)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Gender)
                    .IsRequired()
                    .HasMaxLength(10);

                entity.HasIndex(e => e.Email);
                entity.HasIndex(e => e.UserId);
            });

            // Document Configuration
            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Url)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.HasOne(e => e.User)
                    .WithMany(e => e.Documents)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Interview Configuration
            modelBuilder.Entity<Interview>(entity =>
            {
                entity.HasKey(e => e.InterviewID);

                entity.Property(e => e.Type)
                    .HasMaxLength(50);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.HasOne(e => e.Application)
                    .WithMany()
                    .HasForeignKey(e => e.ApplicationID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Application Configuration
            modelBuilder.Entity<Application>(entity =>
            {
                entity.HasKey(e => e.ApplicationID);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.HasOne(e => e.Candidate)
                    .WithMany()
                    .HasForeignKey(e => e.CandidateID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Job)
                    .WithMany(e => e.Applications)
                    .HasForeignKey(e => e.JobID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // JobOffer Configuration
            modelBuilder.Entity<JobOffer>(entity =>
            {
                entity.HasKey(e => e.OfferID);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.Property(e => e.Salary)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(e => e.Application)
                    .WithMany()
                    .HasForeignKey(e => e.ApplicationID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Recruiter Configuration
            modelBuilder.Entity<Recruiter>(entity =>
            {
                entity.HasKey(e => e.RecruiterID);

                entity.Property(e => e.Department)
                    .HasMaxLength(100);

                entity.HasOne(e => e.User)
                    .WithOne(e => e.Recruiter)
                    .HasForeignKey<Recruiter>(e => e.UserID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // JobPost Configuration
            modelBuilder.Entity<JobPost>(entity =>
            {
                entity.HasKey(e => e.JobPostId);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.HasOne(e => e.Recruiter)
                    .WithMany()
                    .HasForeignKey(e => e.RecruiterId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // JobApplication Configuration
            modelBuilder.Entity<JobApplication>(entity =>
            {
                entity.HasKey(e => e.ApplicationId);

                entity.Property(e => e.Status)
                    .HasMaxLength(50);

                entity.HasOne(e => e.Candidate)
                    .WithMany()
                    .HasForeignKey(e => e.CandidateId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.JobPost)
                    .WithMany(e => e.Applications)
                    .HasForeignKey(e => e.JobPostId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // JobApplicationStatus Configuration
            modelBuilder.Entity<JobApplicationStatus>(entity =>
            {
                entity.HasKey(e => e.StatusID);

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Stage)
                    .HasMaxLength(50);

                entity.Property(e => e.CreatedBy)
                    .HasMaxLength(100);

                entity.HasOne(e => e.JobApplication)
                    .WithMany()
                    .HasForeignKey(e => e.ApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Notification Configuration
            modelBuilder.Entity<UserNotification>(entity =>
            {
                entity.HasKey(e => e.NotificationID);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Message)
                    .IsRequired();

                entity.Property(e => e.Type)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ActionUrl)
                    .HasMaxLength(500);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // SystemSetting Configuration
            modelBuilder.Entity<SystemSetting>(entity =>
            {
                entity.HasKey(e => e.SettingID);

                entity.Property(e => e.Key)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Value)
                    .IsRequired();

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                entity.Property(e => e.Category)
                    .HasMaxLength(50);

                entity.HasIndex(e => e.Key)
                    .IsUnique();
            });

            // Seed initial data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed System Settings
            modelBuilder.Entity<SystemSetting>().HasData(
                new SystemSetting
                {
                    SettingID = 1,
                    Key = "SITE_NAME",
                    Value = "Quản Lý Tuyển Dụng",
                    Description = "Tên của hệ thống",
                    Category = "General"
                },
                new SystemSetting
                {
                    SettingID = 2,
                    Key = "MAX_FILE_SIZE",
                    Value = "5242880", // 5MB
                    Description = "Kích thước file tối đa (bytes)",
                    Category = "Upload"
                },
                new SystemSetting
                {
                    SettingID = 3,
                    Key = "ALLOWED_FILE_TYPES",
                    Value = "pdf,doc,docx,jpg,jpeg,png",
                    Description = "Các loại file được phép upload",
                    Category = "Upload"
                }
            );

            // Seed default admin user
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    UserID = 1,
                    FullName = "Administrator",
                    Email = "admin@recruitment.com",
                    PasswordHash = "admin123", // Should be hashed in production
                    Role = "Admin",
                    IsActive = true,
                    EmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}