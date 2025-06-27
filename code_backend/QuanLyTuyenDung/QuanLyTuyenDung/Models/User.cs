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

        [Required, MaxLength(50)]
        public string Role { get; set; } // Admin, HR, Recruiter, User

        [MaxLength(15)]
        public string? Phone { get; set; } // NULLABLE

        [MaxLength(500)]
        public string? Avatar { get; set; } // SỬA: THÊM ? ĐỂ NULLABLE

        [MaxLength(100)]
        public string? Department { get; set; } // NULLABLE

        [MaxLength(100)]
        public string? Position { get; set; } // NULLABLE

        public bool IsActive { get; set; } = true;
        public bool EmailVerified { get; set; } = false;
        public DateTime? LastLoginAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Profile completion percentage
        public int ProfileCompleteness { get; set; } = 0;

        // Preferences as JSON
        public string? PreferencesJson { get; set; } // NULLABLE

        // Navigation Properties
        public virtual ICollection<Job>? PostedJobs { get; set; }
        public virtual ICollection<Document>? Documents { get; set; }
        public virtual Candidate? Candidate { get; set; }
        public virtual Recruiter? Recruiter { get; set; }

        public int? CompanyId { get; set; }
        public Company? Company { get; set; }
    }

    // User Preferences Class
    public class UserPreferences
    {
        public bool EmailNotifications { get; set; } = true;
        public bool SMSNotifications { get; set; } = false;
        public string PreferredLanguage { get; set; } = "vi";
        public string TimeZone { get; set; } = "Asia/Ho_Chi_Minh";
        public List<string> InterestedJobTypes { get; set; } = new List<string>();
        public List<string> PreferredLocations { get; set; } = new List<string>();
    }

    public class AuthResponse
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "USER"; // Đảm bảo luôn có giá trị mặc định
        public string Token { get; set; } = string.Empty;
        public int? CompanyId { get; set; }
        public DateTime? CreatedAt { get; set; }
        public bool IsAuthenticated { get; set; } = true;
        public string UserRole => Role?.ToUpper() ?? "USER"; // Thêm property để đảm bảo có role in hoa
    }
}