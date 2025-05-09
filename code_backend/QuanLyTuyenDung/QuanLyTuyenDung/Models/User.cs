using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required, MaxLength(100)]
        public string FullName { get; set; }

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; } // HR, Admin, Recruiter

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
