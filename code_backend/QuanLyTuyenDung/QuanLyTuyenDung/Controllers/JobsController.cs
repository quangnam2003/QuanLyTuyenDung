using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IJobService _jobService;
        private readonly ILogger<JobsController> _logger;

        public JobsController(ApplicationDbContext context, IJobService jobService, ILogger<JobsController> logger)
        {
            _context = context;
            _jobService = jobService;
            _logger = logger;
        }

        // GET: api/Jobs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetJobs([FromQuery] string? search, [FromQuery] string? location, [FromQuery] string? type, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Jobs.Include(j => j.User).AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(j => j.Title.Contains(search) ||
                                       j.Description.Contains(search) ||
                                       j.Company.Contains(search));
            }

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(j => j.Location.Contains(location));
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(j => j.Type == type);
            }

            query = query.Where(j => j.Status == "Active");

            var totalCount = await query.CountAsync();
            var jobs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new
                {
                    id = j.JobID,
                    title = j.Title,
                    description = j.Description,
                    requirements = j.Requirements,
                    salary = j.SalaryRange,
                    location = j.Location,
                    company = j.Company,
                    type = j.Type,
                    status = j.Status,
                    department = j.Department,
                    numberOfPositions = j.NumberOfPositions,
                    applicationDeadline = j.ApplicationDeadline,
                    experienceRequired = j.ExperienceRequired,
                    benefits = j.Benefits,
                    detailedLocation = j.DetailedLocation,
                    skills = j.Skills,
                    education = j.Education,
                    createdAt = j.CreatedAt,
                    updatedAt = j.UpdatedAt,
                    viewCount = j.ViewCount,
                    applicationCount = j.ApplicationCount,
                    isFeatured = j.IsFeatured,
                    postedBy = j.User.FullName
                })
                .ToListAsync();

            return Ok(new
            {
                data = jobs,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // GET: api/Jobs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetJob(int id)
        {
            var job = await _context.Jobs
                .Include(j => j.User)
                .Select(j => new
                {
                    id = j.JobID,
                    title = j.Title,
                    description = j.Description,
                    requirements = j.Requirements,
                    salary = j.SalaryRange,
                    location = j.Location,
                    company = j.Company,
                    type = j.Type,
                    status = j.Status,
                    department = j.Department,
                    numberOfPositions = j.NumberOfPositions,
                    applicationDeadline = j.ApplicationDeadline,
                    experienceRequired = j.ExperienceRequired,
                    benefits = j.Benefits,
                    detailedLocation = j.DetailedLocation,
                    skills = j.Skills,
                    education = j.Education,
                    createdAt = j.CreatedAt,
                    updatedAt = j.UpdatedAt,
                    viewCount = j.ViewCount,
                    applicationCount = j.ApplicationCount,
                    isFeatured = j.IsFeatured,
                    postedBy = j.User.FullName
                })
                .FirstOrDefaultAsync(j => j.id == id);

            if (job == null)
            {
                return NotFound();
            }

            // Increment view count
            var jobEntity = await _context.Jobs.FindAsync(id);
            if (jobEntity != null)
            {
                jobEntity.ViewCount++;
                await _context.SaveChangesAsync();
            }

            return job;
        }

        // GET: api/Jobs/featured
        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<object>>> GetFeaturedJobs()
        {
            var featuredJobs = await _context.Jobs
                .Where(j => j.IsFeatured && j.Status == "Active")
                .Include(j => j.User)
                .Select(j => new
                {
                    id = j.JobID,
                    title = j.Title,
                    description = j.Description.Length > 200 ? j.Description.Substring(0, 200) + "..." : j.Description,
                    salary = j.SalaryRange,
                    location = j.Location,
                    company = j.Company,
                    type = j.Type,
                    createdAt = j.CreatedAt,
                    applicationDeadline = j.ApplicationDeadline
                })
                .Take(6)
                .ToListAsync();

            return Ok(featuredJobs);
        }

        // GET: api/Jobs/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchJobs([FromQuery] string q)
        {
            if (string.IsNullOrEmpty(q))
            {
                return BadRequest("Search query is required");
            }

            var jobs = await _context.Jobs
                .Where(j => j.Status == "Active" &&
                           (j.Title.Contains(q) ||
                            j.Description.Contains(q) ||
                            j.Company.Contains(q) ||
                            j.Location.Contains(q)))
                .Include(j => j.User)
                .Select(j => new
                {
                    id = j.JobID,
                    title = j.Title,
                    description = j.Description.Length > 200 ? j.Description.Substring(0, 200) + "..." : j.Description,
                    salary = j.SalaryRange,
                    location = j.Location,
                    company = j.Company,
                    type = j.Type,
                    createdAt = j.CreatedAt
                })
                .Take(20)
                .ToListAsync();

            return Ok(jobs);
        }

        // GET: api/Jobs/recommended
        [HttpGet("recommended")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetRecommendedJobs()
        {
            // Simple recommendation logic - can be enhanced later
            var recommendedJobs = await _context.Jobs
                .Where(j => j.Status == "Active")
                .Include(j => j.User)
                .OrderByDescending(j => j.CreatedAt)
                .Select(j => new
                {
                    id = j.JobID,
                    title = j.Title,
                    description = j.Description.Length > 200 ? j.Description.Substring(0, 200) + "..." : j.Description,
                    salary = j.SalaryRange,
                    location = j.Location,
                    company = j.Company,
                    type = j.Type,
                    createdAt = j.CreatedAt
                })
                .Take(10)
                .ToListAsync();

            return Ok(recommendedJobs);
        }

        // POST: api/Jobs
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Job>> PostJob(CreateJobRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var job = new Job
            {
                Title = request.Title,
                Description = request.Description,
                Requirements = request.Requirements,
                SalaryRange = request.Salary,
                Location = request.Location,
                Company = request.Company,
                Type = request.Type,
                Status = request.Status,
                Department = request.Department,
                NumberOfPositions = request.NumberOfPositions,
                ApplicationDeadline = request.ApplicationDeadline,
                ExperienceRequired = request.ExperienceRequired,
                Benefits = request.Benefits,
                DetailedLocation = request.DetailedLocation,
                Skills = request.Skills ?? new List<string>(),
                Education = request.Education,
                PostedBy = int.Parse(userId),
                CreatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "System"
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJob), new { id = job.JobID }, job);
        }

        // PUT: api/Jobs/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutJob(int id, UpdateJobRequest request)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound();
            }

            // Update fields
            job.Title = request.Title;
            job.Description = request.Description;
            job.Requirements = request.Requirements;
            job.SalaryRange = request.Salary;
            job.Location = request.Location;
            job.Company = request.Company;
            job.Type = request.Type;
            job.Status = request.Status;
            job.Department = request.Department;
            job.NumberOfPositions = request.NumberOfPositions;
            job.ApplicationDeadline = request.ApplicationDeadline;
            job.ExperienceRequired = request.ExperienceRequired;
            job.Benefits = request.Benefits;
            job.DetailedLocation = request.DetailedLocation;
            job.Skills = request.Skills ?? new List<string>();
            job.Education = request.Education;
            job.UpdatedAt = DateTime.UtcNow;
            job.UpdatedBy = User.FindFirst(ClaimTypes.Name)?.Value ?? "System";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JobExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Jobs/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound();
            }

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Jobs/stats
        [HttpGet("stats")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<ActionResult<object>> GetJobStats()
        {
            var totalJobs = await _context.Jobs.CountAsync();
            var activeJobs = await _context.Jobs.CountAsync(j => j.Status == "Active");
            var totalApplications = await _context.JobApplications.CountAsync();
            var recentJobs = await _context.Jobs.CountAsync(j => j.CreatedAt >= DateTime.UtcNow.AddDays(-30));

            return Ok(new
            {
                totalJobs,
                activeJobs,
                totalApplications,
                recentJobs
            });
        }

        private bool JobExists(int id)
        {
            return _context.Jobs.Any(e => e.JobID == id);
        }

        // Request DTOs
        public class CreateJobRequest
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string Requirements { get; set; }
            public string Salary { get; set; }
            public string Location { get; set; }
            public string Company { get; set; }
            public string Type { get; set; }
            public string Status { get; set; }
            public string Department { get; set; }
            public int NumberOfPositions { get; set; }
            public DateTime ApplicationDeadline { get; set; }
            public string ExperienceRequired { get; set; }
            public string Benefits { get; set; }
            public string DetailedLocation { get; set; }
            public List<string> Skills { get; set; }
            public string Education { get; set; }
        }

        public class UpdateJobRequest : CreateJobRequest
        {
        }

        [HttpPost]
        public async Task<ActionResult<Job>> CreateJob([FromBody] Job job)
        {
            try
            {
                _logger.LogInformation("Creating new job: {@Job}", job);
                
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for job creation");
                    return BadRequest(ModelState);
                }

                var createdJob = await _jobService.CreateJobAsync(job);
                _logger.LogInformation("Job created successfully with ID: {JobId}", createdJob.JobID);
                
                return CreatedAtAction(nameof(GetJob), new { id = createdJob.JobID }, createdJob);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job");
                return StatusCode(500, new { message = "Internal server error while creating job" });
            }
        }
    }
}