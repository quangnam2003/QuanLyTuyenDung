using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;
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
        private readonly ILogger<JobsController> _logger;

        public JobsController(ApplicationDbContext context, ILogger<JobsController> logger)
        {
            _context = context;
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
        public async Task<ActionResult<Job>> CreateJob([FromBody] CreateJobRequest request)
        {
            try
            {
                _logger.LogInformation("Creating new job: {@Request}", request);

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for job creation: {@ModelState}", ModelState);
                    return BadRequest(ModelState);
                }

                // Kiểm tra required fields
                if (string.IsNullOrWhiteSpace(request.Title) ||
                    string.IsNullOrWhiteSpace(request.Description) ||
                    string.IsNullOrWhiteSpace(request.Company))
                {
                    return BadRequest(new { message = "Title, Description và Company là bắt buộc" });
                }

                // Lấy user đầu tiên từ database thay vì hardcode
                var firstUser = await _context.Users.FirstOrDefaultAsync();
                if (firstUser == null)
                {
                    _logger.LogError("No users found in database");
                    return BadRequest(new { message = "Không tìm thấy user trong hệ thống" });
                }

                var job = new Job
                {
                    Title = request.Title.Trim(),
                    Description = request.Description.Trim(),
                    Requirements = request.Requirements?.Trim() ?? "",
                    SalaryRange = request.Salary?.Trim() ?? "Thỏa thuận",
                    Location = request.Location?.Trim() ?? "",
                    Company = request.Company.Trim(),
                    Type = request.Type?.Trim() ?? "Full-time",
                    Status = !string.IsNullOrWhiteSpace(request.Status) ? request.Status : "Active",
                    Department = request.Department?.Trim() ?? "IT",
                    NumberOfPositions = request.NumberOfPositions > 0 ? request.NumberOfPositions : 1,
                    ApplicationDeadline = request.ApplicationDeadline != default ? request.ApplicationDeadline : DateTime.UtcNow.AddMonths(1),
                    ExperienceRequired = request.ExperienceRequired?.Trim(),
                    Benefits = request.Benefits?.Trim(),
                    DetailedLocation = request.DetailedLocation?.Trim(),
                    Skills = request.Skills ?? new List<string>(),
                    Education = request.Education?.Trim(),
                    PostedBy = firstUser.UserID, // Sử dụng user thật từ DB
                    CreatedBy = firstUser.FullName,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Jobs.Add(job);
                await _context.SaveChangesAsync();

                // Load lại job với thông tin user
                var createdJob = await _context.Jobs
                    .Include(j => j.User)
                    .FirstOrDefaultAsync(j => j.JobID == job.JobID);

                _logger.LogInformation("Job created successfully with ID: {JobId}", job.JobID);

                return CreatedAtAction(nameof(GetJob), new { id = job.JobID }, createdJob);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job: {Message}", ex.Message);
                return StatusCode(500, new
                {
                    message = "Lỗi tạo việc làm: " + ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        // PUT: api/Jobs/5
        [HttpPut("{id}")]
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
            job.Status = request.Status ?? "Active";
            job.Department = request.Department;
            job.NumberOfPositions = request.NumberOfPositions;
            job.ApplicationDeadline = request.ApplicationDeadline;
            job.ExperienceRequired = request.ExperienceRequired;
            job.Benefits = request.Benefits;
            job.DetailedLocation = request.DetailedLocation;
            job.Skills = request.Skills ?? new List<string>();
            job.Education = request.Education;
            job.UpdatedAt = DateTime.UtcNow;
            job.UpdatedBy = "System";

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
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Requirements { get; set; } = string.Empty;
            public string Salary { get; set; } = string.Empty;
            public string Location { get; set; } = string.Empty;
            public string Company { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string? Status { get; set; }
            public string Department { get; set; } = string.Empty;
            public int NumberOfPositions { get; set; } = 1;
            public DateTime ApplicationDeadline { get; set; }
            public string? ExperienceRequired { get; set; }
            public string? Benefits { get; set; }
            public string? DetailedLocation { get; set; }
            public List<string>? Skills { get; set; }
            public string? Education { get; set; }
        }

        public class UpdateJobRequest : CreateJobRequest
        {
        }
    }
}