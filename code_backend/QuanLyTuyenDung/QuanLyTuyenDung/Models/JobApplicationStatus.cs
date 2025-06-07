using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyTuyenDung.Models
{
    public class JobApplicationStatus
    {
        [Key]
        public int StatusID { get; set; }

        [ForeignKey("JobApplication")]
        public int ApplicationId { get; set; }
        public virtual JobApplication JobApplication { get; set; }

        [Required, MaxLength(50)]
        public string Status { get; set; } // Applied, Screening, Interview, Offer, Hired, Rejected

        [MaxLength(50)]
        public string Stage { get; set; } // Initial Review, Phone Screen, Technical Interview, Final Interview, etc.

        public string Notes { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? ScheduledDate { get; set; }
        public DateTime? CompletedDate { get; set; }

        public bool IsActive { get; set; } = true;
    }

    // System Settings Model
    public class SystemSetting
    {
        [Key]
        public int SettingID { get; set; }

        [Required, MaxLength(100)]
        public string Key { get; set; }

        [Required]
        public string Value { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [MaxLength(50)]
        public string Category { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}