using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyTuyenDung.Models
{
    public class Job
    {
        [Key]
        public int JobID { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Requirements { get; set; }

        [Required, MaxLength(200)]
        public string Location { get; set; }

        [Required, MaxLength(100)]
        public string SalaryRange { get; set; }

        [Required, MaxLength(200)]
        public string Company { get; set; }

        [Required, MaxLength(50)]
        public string Type { get; set; } // Full-time, Part-time, Contract, Internship

        [Required, MaxLength(50)]
        public string Status { get; set; } // Active, Closed, Draft

        [Required, MaxLength(100)]
        public string Department { get; set; }

        [Required]
        public int NumberOfPositions { get; set; } = 1;

        [Required]
        public DateTime ApplicationDeadline { get; set; }

        [MaxLength(200)]
        public string ExperienceRequired { get; set; }

        public string Benefits { get; set; }

        [MaxLength(500)]
        public string DetailedLocation { get; set; }

        [MaxLength(200)]
        public string Education { get; set; }

        // Skills as JSON string
        public string SkillsJson { get; set; }

        [NotMapped]
        public List<string> Skills
        {
            get => string.IsNullOrEmpty(SkillsJson) ? new List<string>() :
                   System.Text.Json.JsonSerializer.Deserialize<List<string>>(SkillsJson);
            set => SkillsJson = System.Text.Json.JsonSerializer.Serialize(value);
        }

        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string CreatedBy { get; set; }

        [MaxLength(100)]
        public string UpdatedBy { get; set; }

        public int ViewCount { get; set; } = 0;
        public int ApplicationCount { get; set; } = 0;

        public bool IsFeatured { get; set; } = false;
        public bool IsRemote { get; set; } = false;
        public bool IsUrgent { get; set; } = false;

        // Foreign Keys
        [ForeignKey("User")]
        public int PostedBy { get; set; }
        public virtual User User { get; set; }

        // Navigation Properties
        public virtual ICollection<Application> Applications { get; set; }
        public virtual ICollection<JobApplication> JobApplications { get; set; }
    }
}