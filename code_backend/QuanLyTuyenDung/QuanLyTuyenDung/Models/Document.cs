using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required, MaxLength(50)]
        public string Type { get; set; } // Resume, Cover Letter, Certificate, etc.

        [Required, MaxLength(200)]
        public string Name { get; set; }

        [Required, MaxLength(500)]
        public string Url { get; set; }

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual User User { get; set; }
    }
} 