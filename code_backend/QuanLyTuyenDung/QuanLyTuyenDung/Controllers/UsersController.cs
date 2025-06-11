using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTuyenDung.Models;
using QuanLyTuyenDung.DBContext;      
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyTuyenDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
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
            // Kiểm tra người dùng hiện tại (lấy từ token, session, hoặc User.Identity)
            var currentUser = await _context.Users.FindAsync(User.Identity.Name); // hoặc lấy từ token
            if (currentUser == null) return Unauthorized();

            // Kiểm tra quyền: chỉ Admin hoặc chính user đó mới được phép xem thông tin chi tiết
            if (currentUser.Role != "Admin" && currentUser.UserID != id) return Forbid();

            // Kiểm tra user cần lấy có tồn tại không
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserById), new { id = user.UserID }, user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            if (id != updatedUser.UserID)
                return BadRequest();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // Cập nhật các thông tin cần thiết
            user.FullName = updatedUser.FullName;
            user.Email = updatedUser.Email;
            if (!string.IsNullOrEmpty(updatedUser.Role))
            {
                user.Role = updatedUser.Role;
            }

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

            return Ok(new UserDto {
                id = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            });
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

        // Đăng ký tài khoản mới
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.email))
                return BadRequest(new { message = "Email đã tồn tại." });

            var fullName = request.firstName + " " + request.lastName;

            var user = new User
            {
                FullName = fullName,
                Email = request.email,
                PasswordHash = request.password, // Nếu muốn bảo mật, hãy hash mật khẩu ở đây!
                Role = "User",
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công!" });
        }

        public class RegisterRequest
        {
            public string email { get; set; }
            public string password { get; set; }
            public string firstName { get; set; }
            public string lastName { get; set; }
            public string phone { get; set; }
        }

        // Đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.email);
            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại." });

            if (user.PasswordHash != request.password)
                return Unauthorized(new { message = "Sai mật khẩu." });

            // Trả về đúng tên trường cho frontend
            return Ok(new {
                id = user.UserID,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            });
        }

        public class LoginRequest
        {
            public string email { get; set; }
            public string password { get; set; }
        }

        // Thay đổi quyền người dùng
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] RoleUpdateRequest request)
        {
            // Kiểm tra người dùng hiện tại (ví dụ: lấy từ token, session, hoặc User.Identity)
            var currentUser = await _context.Users.FindAsync(User.Identity.Name); // hoặc lấy từ token
            if (currentUser == null) return Unauthorized();

            // Kiểm tra quyền: chỉ Admin mới được phép cập nhật role
            if (currentUser.Role != "Admin") return Forbid();

            // Kiểm tra user cần cập nhật có tồn tại không
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            // Kiểm tra role hợp lệ
            var validRoles = new[] { "Admin", "User", "HR" };
            if (!validRoles.Contains(request.Role)) return BadRequest("Vai trò không hợp lệ");

            // Cập nhật role
            user.Role = request.Role;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.FullName = updatedUser.FullName;
            user.Email = updatedUser.Email;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(user);
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

        public class UserDto
        {
            public int id { get; set; }
            public string fullName { get; set; }
            public string email { get; set; }
            public string role { get; set; }
        }

        public class RoleUpdateRequest
        {
            public string Role { get; set; }
        }
    }
}
