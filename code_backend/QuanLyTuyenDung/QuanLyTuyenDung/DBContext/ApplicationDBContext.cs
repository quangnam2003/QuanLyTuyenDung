using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
namespace QuanLyTuyenDung.DBContext
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        public DbSet<Candidate> Candidates { get; set; }    
        public DbSet<Job> Jobs { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Recruiter> Recruiters { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<JobOffer> JobOffers { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships and constraints here if needed
            base.OnModelCreating(modelBuilder);
        }
    }
}
