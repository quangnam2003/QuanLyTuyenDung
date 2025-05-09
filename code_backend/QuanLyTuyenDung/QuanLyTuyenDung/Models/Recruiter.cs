using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class Recruiter
    {
        [Key]
        public int RecruiterID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; }

        public string Department { get; set; }
    }
}
