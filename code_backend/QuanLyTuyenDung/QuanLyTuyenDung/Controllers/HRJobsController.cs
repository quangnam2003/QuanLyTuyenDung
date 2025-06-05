using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/hr")]
    [ApiController]
    public class HRJobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HRJobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/hr/{id}/jobs
        [HttpGet("{id}/jobs")]
        public async Task<ActionResult<IEnumerable<JobPost>>> GetRecruiterJobs(int id)
        {
            return await _context.JobPosts.Where(j => j.RecruiterId == id).ToListAsync();
        }

        // POST: api/hr/{id}/jobs
        [HttpPost("{id}/jobs")]
        public async Task<ActionResult<JobPost>> CreateJobPost(int id, JobPost jobPost)
        {
            jobPost.RecruiterId = id;
            _context.JobPosts.Add(jobPost);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRecruiterJobs), new { id = id }, jobPost);
        }

        // PUT: api/hr/jobs/{jobId}
        [HttpPut("jobs/{jobId}")]
        public async Task<IActionResult> UpdateJobPost(int jobId, JobPost updatedPost)
        {
            if (jobId != updatedPost.JobPostId)
                return BadRequest();

            _context.Entry(updatedPost).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/hr/jobs/{jobId}
        [HttpDelete("jobs/{jobId}")]
        public async Task<IActionResult> DeleteJobPost(int jobId)
        {
            var job = await _context.JobPosts.FindAsync(jobId);
            if (job == null) return NotFound();

            _context.JobPosts.Remove(job);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/hr/jobs/{jobId}/applicants
        [HttpGet("jobs/{jobId}/applicants")]
        public async Task<ActionResult<IEnumerable<JobApplication>>> GetApplicants(int jobId)
        {
            return await _context.JobApplications
                .Include(a => a.Candidate)
                .Where(a => a.JobPostId == jobId)
                .ToListAsync();
        }

        // PUT: api/hr/applicants/{id}/status
        [HttpPut("applicants/{id}/status")]
        public async Task<IActionResult> UpdateApplicantStatus(int id, [FromBody] string status)
        {
            var application = await _context.JobApplications.FindAsync(id);
            if (application == null) return NotFound();

            application.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
