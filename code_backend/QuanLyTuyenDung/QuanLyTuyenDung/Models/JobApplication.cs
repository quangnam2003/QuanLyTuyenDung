using QuanLyTuyenDung.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class JobApplication
{
    [Key]
    public int ApplicationId { get; set; }

    [ForeignKey("Candidate")]
    public int CandidateId { get; set; }
    public Candidate Candidate { get; set; }

    [ForeignKey("JobPost")]
    public int JobPostId { get; set; }
    public JobPost JobPost { get; set; }

    public DateTime AppliedAt { get; set; } = DateTime.Now;

    public string Status { get; set; } // Applied, Viewed, Interviewed, Rejected, Hired
}
