using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    id = u.UserID,
                    fullName = u.FullName,
                    email = u.Email,
                    role = u.Role
                }).ToListAsync();
            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            var userDto = new UserDto
            {
                id = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            };

            return Ok(userDto);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<UserDto>> PostUser(CreateUserRequest request)
        {
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = request.Password, // In production, hash this password
                Role = request.Role?.ToUpper() ?? "USER",
                Phone = request.Phone,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                id = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            };

            return CreatedAtAction(nameof(GetUserById), new { id = user.UserID }, userDto);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // Update fields
            user.FullName = request.FullName;
            user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Role))
            {
                user.Role = request.Role?.ToUpper();
            }
            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var userDto = new UserDto
            {
                id = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            };

            return Ok(userDto);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest model)
        {
            try
            {
                // Kiểm tra email đã tồn tại
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Email đã được sử dụng" });
                }

                // Hash mật khẩu (TODO: Thay thế bằng phương thức hash thực tế)
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.password);

                var user = new User
                {
                    Email = model.email,
                    PasswordHash = hashedPassword,
                    FullName = model.firstName + " " + model.lastName,
                    Phone = model.phone,
                    Role = model.Role?.ToUpper() ?? "USER",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    EmailVerified = false // Cần xác thực email
                };

                if (model.Role?.ToUpper() == "HR" && model.Company != null)
                {
                    var company = new Company
                    {
                        Name = model.Company.Name,
                        Industry = model.Company.Industry,
                        Size = model.Company.Size,
                        Location = model.Company.Location,
                        Website = model.Company.Website,
                        Description = model.Company.Description,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Companies.Add(company);
                    await _context.SaveChangesAsync();

                    user.CompanyId = company.Id;
                }

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new AuthResponse
                {
                    Id = user.UserID,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role?.ToUpper() ?? "USER",
                    Token = GenerateJwtToken(user),
                    CompanyId = user.CompanyId
                });
            }
            catch (Exception ex)
            {
                // Log lỗi
                return StatusCode(500, new { message = "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại." });
            }
        }

        // POST: api/Users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            try
            {
                Console.WriteLine($"Login attempt for email: {model.email}");

                var user = await _context.Users.Include(u => u.Company)
                    .FirstOrDefaultAsync(u => u.Email == model.email);
                
                if (user == null)
                {
                    Console.WriteLine($"User not found for email: {model.email}");
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
                }

                Console.WriteLine($"Found user: ID={user.UserID}, Email={user.Email}, Role={user.Role}");

                // Kiểm tra xem mật khẩu có phải là hash bcrypt hay không
                bool isBcryptHash = !string.IsNullOrEmpty(user.PasswordHash) && 
                                  user.PasswordHash.StartsWith("$2") && 
                                  user.PasswordHash.Length > 50;
                
                bool validPassword = false;

                if (isBcryptHash)
                {
                    try
                    {
                        // Mật khẩu đã được hash bằng BCrypt
                        validPassword = BCrypt.Net.BCrypt.Verify(model.password, user.PasswordHash);
                        Console.WriteLine($"BCrypt password verification result: {validPassword}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error verifying BCrypt password: {ex.Message}");
                        validPassword = false;
                    }
                }
                else
                {
                    // Mật khẩu chưa được hash hoặc được lưu trực tiếp
                    validPassword = (user.PasswordHash == model.password);
                    Console.WriteLine($"Plain text password verification result: {validPassword}");
                }

                if (!validPassword)
                {
                    Console.WriteLine("Password verification failed");
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
                }

                // Đảm bảo role luôn được chuyển sang in hoa
                var role = user.Role?.ToUpper() ?? "USER";
                Console.WriteLine($"User role (normalized): {role}");

                // Generate JWT token
                var token = GenerateJwtToken(user);
                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("Failed to generate JWT token");
                    return StatusCode(500, new { message = "Lỗi tạo token xác thực" });
                }

                Console.WriteLine("JWT token generated successfully");

                var response = new AuthResponse
                {
                    Id = user.UserID,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = role,
                    Token = token,
                    CompanyId = user.CompanyId,
                    CreatedAt = user.CreatedAt,
                    IsAuthenticated = true
                };

                Console.WriteLine($"Login successful. Returning response for user: {response.Email}, Role: {response.Role}");
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Đã có lỗi xảy ra khi đăng nhập: " + ex.Message });
            }
        }

        // PUT: api/Users/5/role
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleUpdateRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // Validate role
            var validRoles = new[] { "ADMIN", "USER", "HR", "RECRUITER" };
            if (!validRoles.Contains(request.Role?.ToUpper()))
            {
                return BadRequest("Vai trò không hợp lệ");
            }
            user.Role = request.Role?.ToUpper();
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                id = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            };

            return Ok(userDto);
        }

        // PUT: api/Users/5/profile
        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UpdateProfileRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Phone = request.Phone;
            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();

                var userDto = new UserDto
                {
                    id = user.UserID,
                    fullName = user.FullName,
                    email = user.Email,
                    role = user.Role
                };

                return Ok(userDto);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                    return NotFound();
                throw;
            }
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserID == id);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "DefaultSecretKeyForDevelopment12345678901234");
            
            // Đảm bảo role luôn được chuyển thành chữ in hoa
            string role = user.Role?.ToUpper() ?? "USER";
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, role),
                new Claim("UserRole", role) // Thêm một claim riêng để đảm bảo
            };
            
            // Thêm CompanyId vào claims nếu có
            if (user.CompanyId.HasValue)
            {
                claims.Add(new Claim("CompanyId", user.CompanyId.Value.ToString()));
                Console.WriteLine($"Adding CompanyId claim: {user.CompanyId.Value}");
            }
            else
            {
                Console.WriteLine("User has no CompanyId");
            }
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature
                ),
                Issuer = _configuration["Jwt:Issuer"] ?? "QuanLyTuyenDungAPI",
                Audience = _configuration["Jwt:Audience"] ?? "QuanLyTuyenDungClient"
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            
            // Log token details for debugging
            var decodedToken = tokenHandler.ReadJwtToken(tokenString);
            Console.WriteLine("Generated token claims:");
            foreach (var claim in decodedToken.Claims)
            {
                Console.WriteLine($"- {claim.Type}: {claim.Value}");
            }
            
            return tokenString;
        }

        // DTOs
        public class UserDto
        {
            public int id { get; set; }
            public string fullName { get; set; } = string.Empty;
            public string email { get; set; } = string.Empty;
            public string role { get; set; } = string.Empty;
        }

        public class CreateUserRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string? Role { get; set; }
            public string? Phone { get; set; }
        }

        public class UpdateUserRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string? Role { get; set; }
        }

        public class RegisterRequest
        {
            public string email { get; set; } = string.Empty;
            public string password { get; set; } = string.Empty;
            public string firstName { get; set; } = string.Empty;
            public string lastName { get; set; } = string.Empty;
            public string? phone { get; set; }
            public string? Role { get; set; }
            public CompanyDto? Company { get; set; }
        }

        public class LoginRequest
        {
            public string email { get; set; } = string.Empty;
            public string password { get; set; } = string.Empty;
        }

        public class RoleUpdateRequest
        {
            public string Role { get; set; } = string.Empty;
        }

        public class UpdateProfileRequest
        {
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string? Phone { get; set; }
        }

        public class CompanyDto
        {
            public string Name { get; set; } = string.Empty;
            public string Industry { get; set; } = string.Empty;
            public string Size { get; set; } = string.Empty;
            public string Location { get; set; } = string.Empty;
            public string Website { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
        }
    }
}