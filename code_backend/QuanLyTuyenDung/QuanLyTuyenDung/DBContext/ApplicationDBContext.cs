using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;

namespace QuanLyTuyenDung.DBContext
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Job Configuration
            modelBuilder.Entity<Job>()
                .Property(j => j.Title)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Job>()
                .Property(j => j.Status)
                .HasConversion<string>();

            modelBuilder.Entity<Job>()
                .Property(j => j.Type)
                .HasConversion<string>();

            // Candidate Configuration
            modelBuilder.Entity<Candidate>()
                .Property(c => c.Email)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<Candidate>()
                .Property(c => c.Phone)
                .IsRequired()
                .HasMaxLength(20);

            modelBuilder.Entity<Candidate>()
                .Property(c => c.UserId)
                .IsRequired();

            // Document Configuration
            modelBuilder.Entity<Document>()
                .Property(d => d.Type)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<Document>()
                .Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(200);

            modelBuilder.Entity<Document>()
                .Property(d => d.Url)
                .IsRequired()
                .HasMaxLength(500);

            modelBuilder.Entity<Document>()
                .HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Interview Configuration
            modelBuilder.Entity<Interview>()
                .Property(i => i.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Interview>()
                .Property(i => i.Status)
                .HasConversion<string>();

            // User Configuration
            modelBuilder.Entity<User>()
                .Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Application Configuration
            modelBuilder.Entity<Application>()
                .Property(a => a.Status)
                .HasConversion<string>();

            // JobOffer Configuration
            modelBuilder.Entity<JobOffer>()
                .Property(j => j.Status)
                .HasConversion<string>();

            modelBuilder.Entity<JobPost>()
                .Property(j => j.Type)
                .HasConversion<string>();

            modelBuilder.Entity<JobApplication>()
                .Property(a => a.Status)
                .HasConversion<string>();

        }
    }
} 