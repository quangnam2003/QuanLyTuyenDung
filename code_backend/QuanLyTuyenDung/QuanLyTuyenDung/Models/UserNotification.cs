using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyTuyenDung.Models
{
    public class UserNotification
    {
        [Key]
        public int NotificationID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }
        public virtual User User { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Message { get; set; }

        [Required, MaxLength(50)]
        public string Type { get; set; } // Info, Success, Warning, Error

        public bool IsRead { get; set; } = false;

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }

        // Related entities for reference
        public int? RelatedJobID { get; set; }
        public int? RelatedApplicationID { get; set; }
        public int? RelatedInterviewID { get; set; }

        // Priority level
        [MaxLength(20)]
        public string Priority { get; set; } = "Normal"; // Low, Normal, High, Urgent

        // Expiry date for temporary notifications
        public DateTime? ExpiresAt { get; set; }

        // Metadata for additional data
        public string? Metadata { get; set; } // JSON string for additional data

        // Navigation properties (optional)
        [ForeignKey("RelatedJobID")]
        public virtual Job? RelatedJob { get; set; }

        [ForeignKey("RelatedApplicationID")]
        public virtual Application? RelatedApplication { get; set; }

        [ForeignKey("RelatedInterviewID")]
        public virtual Interview? RelatedInterview { get; set; }
    }

    // Notification Types Enum (for reference)
    public static class UserNotificationType
    {
        public const string Info = "Info";
        public const string Success = "Success";
        public const string Warning = "Warning";
        public const string Error = "Error";
    }

    // Notification Priority Enum (for reference)
    public static class UserNotificationPriority
    {
        public const string Low = "Low";
        public const string Normal = "Normal";
        public const string High = "High";
        public const string Urgent = "Urgent";
    }
}