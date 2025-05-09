using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Job
    {
        [Key]
        public int JobID { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        [MaxLength(100)]
        public string Location { get; set; }

        public string SalaryRange { get; set; }

        [ForeignKey("User")]
        public int PostedBy { get; set; }
        public User User { get; set; }

        public string Status { get; set; } // "Open", "Closed"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
