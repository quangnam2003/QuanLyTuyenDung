using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Application
    {
        [Key]
        public int ApplicationID { get; set; }

        [ForeignKey("Candidate")]
        public int CandidateID { get; set; }
        public Candidate Candidate { get; set; }

        [ForeignKey("Job")]
        public int JobID { get; set; }
        public Job Job { get; set; }

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } // "Pending", "Interview", "Rejected", "Accepted"
    }
}
