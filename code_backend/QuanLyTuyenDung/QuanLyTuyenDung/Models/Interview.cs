using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Interview
    {
        public int InterviewID { get; set; }
        public int ApplicationID { get; set; }
        public Application Application { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Interviewers { get; set; }
        public string Notes { get; set; }
        public string Status { get; set; }
        public string Type { get; set; } // Added missing 'Type' property to fix CS1061  
    }
}
