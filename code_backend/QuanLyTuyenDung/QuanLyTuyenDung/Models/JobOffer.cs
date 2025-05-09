using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace QuanLyTuyenDung.Models
{
    public class JobOffer
    {
        [Key]
        public int OfferID { get; set; }

        [ForeignKey("Application")]
        public int ApplicationID { get; set; }
        public Application Application { get; set; }

        public decimal Salary { get; set; }

        public DateTime StartDate { get; set; }

        public string Status { get; set; } // "Pending", "Accepted", "Rejected"

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
