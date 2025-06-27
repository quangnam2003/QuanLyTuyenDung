using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Models;

namespace QuanLyTuyenDung.Services
{
    public class JobService : IJobService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<JobService> _logger;

        public JobService(ApplicationDbContext context, ILogger<JobService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Job> CreateJobAsync(Job job)
        {
            try
            {
                _context.Jobs.Add(job);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Job created with ID: {job.JobID}");
                return job;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job");
                throw;
            }
        }

        public async Task<Job?> GetJobByIdAsync(int id)
        {
            return await _context.Jobs
                .Include(j => j.User)
                .FirstOrDefaultAsync(j => j.JobID == id);
        }

        public async Task<IEnumerable<Job>> GetJobsAsync()
        {
            return await _context.Jobs
                .Include(j => j.User)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task<Job> UpdateJobAsync(Job job)
        {
            try
            {
                _context.Entry(job).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Job updated with ID: {job.JobID}");
                return job;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating job with ID: {job.JobID}");
                throw;
            }
        }

        public async Task DeleteJobAsync(int id)
        {
            try
            {
                var job = await _context.Jobs.FindAsync(id);
                if (job != null)
                {
                    _context.Jobs.Remove(job);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Job deleted with ID: {id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting job with ID: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<Job>> SearchJobsAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                return await GetJobsAsync();
            }

            return await _context.Jobs
                .Include(j => j.User)
                .Where(j => j.Title.Contains(searchTerm) ||
                           j.Description.Contains(searchTerm) ||
                           j.Company.Contains(searchTerm) ||
                           j.Location.Contains(searchTerm))
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }
    }
}