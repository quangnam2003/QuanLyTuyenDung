using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.IO;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public CandidatesController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // --------- API cho ADMIN (CRUD) ---------
        // GET: api/Candidates
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            return await _context.Candidates.ToListAsync();
        }

        // GET: api/Candidates/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Candidate>> GetCandidate(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }
            return candidate;
        }

        // POST: api/Candidates
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Candidate>> PostCandidate(Candidate candidate)
        {
            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCandidate), new { id = candidate.CandidateID }, candidate);
        }

        // PUT: api/Candidates/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutCandidate(int id, Candidate candidate)
        {
            if (id != candidate.CandidateID)
            {
                return BadRequest();
            }
            _context.Entry(candidate).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CandidateExists(id))
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

        // DELETE: api/Candidates/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }
            _context.Candidates.Remove(candidate);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --------- API cho ỨNG VIÊN (quản lý hồ sơ cá nhân) ---------
        // GET: api/Candidates/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<Candidate>> GetCurrentUserProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var candidate = await _context.Candidates.FirstOrDefaultAsync(c => c.UserId == userId);
            if (candidate == null)
            {
                return NotFound();
            }
            return candidate;
        }

        // POST: api/Candidates/profile
        [HttpPost("profile")]
        [Authorize]
        public async Task<ActionResult<Candidate>> SaveProfile([FromBody] Candidate profile)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var existingCandidate = await _context.Candidates.FirstOrDefaultAsync(c => c.UserId == userId);
            if (existingCandidate == null)
            {
                profile.UserId = userId;
                profile.CreatedAt = DateTime.UtcNow;
                _context.Candidates.Add(profile);
            }
            else
            {
                existingCandidate.FirstName = profile.FirstName;
                existingCandidate.LastName = profile.LastName;
                existingCandidate.Phone = profile.Phone;
                existingCandidate.Address = profile.Address;
                existingCandidate.DateOfBirth = profile.DateOfBirth;
                existingCandidate.Gender = profile.Gender;
                existingCandidate.Education = profile.Education;
                existingCandidate.Experience = profile.Experience;
                existingCandidate.Skills = profile.Skills;
                existingCandidate.Languages = profile.Languages;
                existingCandidate.UpdatedAt = DateTime.UtcNow;
            }
            try
            {
                await _context.SaveChangesAsync();
                return Ok(existingCandidate ?? profile);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CandidateExists(userId))
                {
                    return NotFound();
                }
                throw;
            }
        }

        // POST: api/Candidates/upload-resume
        [HttpPost("upload-resume")]
        [Authorize]
        public async Task<ActionResult<Document>> UploadResume(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }
            var allowedTypes = new[] { ".pdf", ".doc", ".docx" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedTypes.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Only PDF, DOC, and DOCX files are allowed.");
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            var uploadsDir = Path.Combine(_environment.WebRootPath, "uploads", "resumes");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var document = new Document
            {
                Type = "Resume",
                Name = file.FileName,
                Url = $"/uploads/resumes/{fileName}",
                UploadDate = DateTime.UtcNow,
                UserId = int.Parse(userId)
            };
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();
            return Ok(document);
        }

        // GET: api/Candidates/documents
        [HttpGet("documents")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Document>>> GetUploadedDocuments()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            int userIdInt = int.Parse(userId);
            var documents = await _context.Documents
                .Where(d => d.UserId == userIdInt && d.Type == "Resume")
                .OrderByDescending(d => d.UploadDate)
                .ToListAsync();
            return documents;
        }

        // DELETE: api/Candidates/documents/{id}
        [HttpDelete("documents/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            int userIdInt = int.Parse(userId);
            var document = await _context.Documents.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userIdInt);
            if (document == null)
            {
                return NotFound();
            }
            var filePath = Path.Combine(_environment.WebRootPath, document.Url.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool CandidateExists(int id)
        {
            return _context.Candidates.Any(e => e.CandidateID == id);
        }
        private bool CandidateExists(string userId)
        {
            return _context.Candidates.Any(e => e.UserId == userId);
        }
    }
}
