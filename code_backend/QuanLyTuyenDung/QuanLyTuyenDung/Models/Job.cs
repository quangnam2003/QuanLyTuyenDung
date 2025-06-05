using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Job
    {
        public int JobID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public string SalaryRange { get; set; }
        public int PostedBy { get; set; }
        public User User { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Type { get; set; } 
        public bool IsFeatured { get; set; }
    }
}
