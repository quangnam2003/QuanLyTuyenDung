using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Candidate
    {
        [Key]
        public int CandidateID { get; set; }

        [Required, MaxLength(100)]
        public string FullName { get; set; }

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [MaxLength(15)]
        public string Phone { get; set; }

        public string Resume { get; set; } // File path

        public string LinkedInProfile { get; set; }

        public string Status { get; set; } // "Pending", "Interviewed", "Hired"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
