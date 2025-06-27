using QuanLyTuyenDung.Models;

namespace QuanLyTuyenDung.Services
{
    public interface IJobService
    {
        Task<Job> CreateJobAsync(Job job);
        Task<Job?> GetJobByIdAsync(int id);
        Task<IEnumerable<Job>> GetJobsAsync();
        Task<Job> UpdateJobAsync(Job job);
        Task DeleteJobAsync(int id);
        Task<IEnumerable<Job>> SearchJobsAsync(string searchTerm);
    }
}