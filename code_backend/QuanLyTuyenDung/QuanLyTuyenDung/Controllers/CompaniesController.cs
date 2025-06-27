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
    [Authorize]
    public class CompaniesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<CompaniesController> _logger;

        public CompaniesController(
            ApplicationDbContext context, 
            IWebHostEnvironment environment,
            ILogger<CompaniesController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        // GET: api/Companies/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Company>> GetCompany(int id)
        {
            _logger.LogInformation($"Getting company with ID: {id}");
            
            // Log all claims for debugging
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            _logger.LogInformation($"User claims: {System.Text.Json.JsonSerializer.Serialize(claims)}");
            
            var company = await _context.Companies.FindAsync(id);

            if (company == null)
            {
                _logger.LogWarning($"Company with ID {id} not found");
                return NotFound(new { message = "Không tìm thấy thông tin công ty" });
            }

            // Kiểm tra quyền truy cập
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value?.ToUpper();
            var userCompanyId = User.FindFirst("CompanyId")?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            _logger.LogInformation($"Access check - User ID: {userId}, Role: {userRole}, CompanyId: {userCompanyId}");

            // ADMIN có thể xem tất cả công ty
            if (userRole == "ADMIN")
            {
                _logger.LogInformation($"User is ADMIN, allowing access to company {id}");
                return company;
            }

            // HR chỉ có thể xem công ty của mình
            if (userRole == "HR")
            {
                if (userCompanyId == null)
                {
                    _logger.LogWarning($"HR user {userId} has no CompanyId claim");
                    return Forbid();
                }

                if (int.Parse(userCompanyId) != company.Id)
                {
                    _logger.LogWarning($"HR user {userId} attempted to access company {id} but is linked to company {userCompanyId}");
                    return Forbid();
                }

                _logger.LogInformation($"HR user {userId} granted access to their company {id}");
                return company;
            }

            // Các role khác không có quyền xem thông tin công ty
            _logger.LogWarning($"User {userId} with role {userRole} attempted to access company {id}");
            return Forbid();
        }

        // PUT: api/Companies/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "HR,ADMIN")]
        public async Task<IActionResult> UpdateCompany(int id, [FromBody] CompanyUpdateRequest request)
        {
            // Kiểm tra quyền truy cập
            var userCompanyId = User.FindFirst("CompanyId")?.Value;
            if (userCompanyId == null || int.Parse(userCompanyId) != id)
            {
                return Forbid();
            }

            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin công ty" });
            }

            // Cập nhật thông tin
            company.Name = request.Name ?? company.Name;
            company.Industry = request.Industry ?? company.Industry;
            company.Size = request.Size ?? company.Size;
            company.Location = request.Location ?? company.Location;
            company.Website = request.Website;
            company.Description = request.Description;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(company);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompanyExists(id))
                {
                    return NotFound();
                }
                throw;
            }
        }

        // POST: api/Companies/{id}/logo
        [HttpPost("{id}/logo")]
        [Authorize(Roles = "HR,ADMIN")]
        public async Task<IActionResult> UploadLogo(int id, IFormFile logo)
        {
            // Kiểm tra quyền truy cập
            var userCompanyId = User.FindFirst("CompanyId")?.Value;
            if (userCompanyId == null || int.Parse(userCompanyId) != id)
            {
                return Forbid();
            }

            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound(new { message = "Không tìm thấy thông tin công ty" });
            }

            if (logo == null || logo.Length == 0)
            {
                return BadRequest(new { message = "Không có file được upload" });
            }

            if (logo.Length > 2 * 1024 * 1024) // 2MB
            {
                return BadRequest(new { message = "Kích thước file không được vượt quá 2MB" });
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(logo.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Chỉ chấp nhận file PNG hoặc JPG" });
            }

            try
            {
                // Tạo thư mục nếu chưa tồn tại
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "logos");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Xóa logo cũ nếu có
                if (!string.IsNullOrEmpty(company.Logo))
                {
                    var oldLogoPath = Path.Combine(_environment.WebRootPath, company.Logo.TrimStart('/'));
                    if (System.IO.File.Exists(oldLogoPath))
                    {
                        System.IO.File.Delete(oldLogoPath);
                    }
                }

                // Lưu file mới
                var uniqueFileName = $"{company.Id}_{DateTime.Now.Ticks}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await logo.CopyToAsync(fileStream);
                }

                // Cập nhật đường dẫn trong database
                company.Logo = $"/uploads/logos/{uniqueFileName}";
                await _context.SaveChangesAsync();

                return Ok(new { logoUrl = company.Logo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Không thể upload logo: " + ex.Message });
            }
        }

        private bool CompanyExists(int id)
        {
            return _context.Companies.Any(e => e.Id == id);
        }

        public class CompanyUpdateRequest
        {
            public string? Name { get; set; }
            public string? Industry { get; set; }
            public string? Size { get; set; }
            public string? Location { get; set; }
            public string? Website { get; set; }
            public string? Description { get; set; }
        }
    }
}