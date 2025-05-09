using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Interview
    {
        [Key]
        public int InterviewID { get; set; }

        [ForeignKey("Application")]
        public int ApplicationID { get; set; }
        public Application Application { get; set; }

        public DateTime ScheduledAt { get; set; }

        public string Interviewers { get; set; } // List of names

        public string Notes { get; set; }

        public string Status { get; set; } // "Scheduled", "Completed", "Cancelled"
    }
}
