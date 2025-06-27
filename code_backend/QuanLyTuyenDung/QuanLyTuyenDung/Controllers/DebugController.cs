using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.DBContext;
using QuanLyTuyenDung.Models;
using System.Text.Json;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebugController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DebugController> _logger;
        private readonly IConfiguration _configuration;

        public DebugController(
            ApplicationDbContext context,
            ILogger<DebugController> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        // GET: api/Debug/database-status
        [HttpGet("database-status")]
        public async Task<ActionResult<object>> GetDatabaseStatus()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                var userCount = await _context.Users.CountAsync();
                var jobCount = await _context.Jobs.CountAsync();

                var users = await _context.Users.Take(5).Select(u => new
                {
                    u.UserID,
                    u.FullName,
                    u.Email,
                    u.Role
                }).ToListAsync();

                return Ok(new
                {
                    canConnect,
                    userCount,
                    jobCount,
                    sampleUsers = users,
                    databaseName = _context.Database.GetDbConnection().Database
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking database status");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/Debug/create-test-user
        [HttpPost("create-test-user")]
        public async Task<ActionResult<object>> CreateTestUser()
        {
            try
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync();
                if (existingUser != null)
                {
                    return Ok(new { message = "User đã tồn tại", user = existingUser });
                }

                var user = new QuanLyTuyenDung.Models.User
                {
                    FullName = "Admin Test",
                    Email = "admin@test.com",
                    PasswordHash = "123456",
                    Role = "Admin",
                    IsActive = true,
                    EmailVerified = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User test đã được tạo", user = new { user.UserID, user.FullName, user.Email } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test user");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                Status = "OK",
                Timestamp = DateTime.UtcNow,
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
            });
        }

        [HttpGet("db-connection")]
        public async Task<IActionResult> CheckDatabaseConnection()
        {
            try
            {
                bool canConnect = await _context.Database.CanConnectAsync();
                return Ok(new
                {
                    CanConnect = canConnect,
                    DatabaseProvider = _context.Database.ProviderName,
                    ConnectionString = "**redacted**" // Không hiển thị connection string thật
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra kết nối database");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new
                    {
                        u.UserID,
                        u.Email,
                        u.FullName,
                        u.Role,
                        PasswordLength = u.PasswordHash.Length,
                        IsBcryptHash = u.PasswordHash.StartsWith("$2"),
                        u.IsActive,
                        u.CreatedAt
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách users");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        [HttpPost("check-login")]
        public async Task<IActionResult> CheckLogin([FromBody] UsersController.LoginRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.email);

                if (user == null)
                {
                    return NotFound(new { message = "Không tìm thấy user với email này" });
                }

                var result = new
                {
                    UserFound = true,
                    Email = user.Email,
                    StoredPasswordHash = user.PasswordHash,
                    IsBcryptHash = user.PasswordHash.StartsWith("$2") && user.PasswordHash.Length > 50,
                    PasswordMatch = false,
                    PlainTextMatch = user.PasswordHash == request.password
                };

                // Kiểm tra mật khẩu nếu là hash bcrypt
                if (result.IsBcryptHash)
                {
                    try
                    {
                        result = new
                        {
                            result.UserFound,
                            result.Email,
                            result.StoredPasswordHash,
                            result.IsBcryptHash,
                            PasswordMatch = BCrypt.Net.BCrypt.Verify(request.password, user.PasswordHash),
                            result.PlainTextMatch
                        };
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new { message = "Lỗi khi xác thực mật khẩu: " + ex.Message });
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra đăng nhập");
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
}