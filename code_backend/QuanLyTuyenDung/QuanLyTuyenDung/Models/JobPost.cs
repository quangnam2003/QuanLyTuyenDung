using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyTuyenDung.Models
{
    public class JobPost
    {
        [Key]
        public int JobPostId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        public string Location { get; set; }

        [Required]
        public string Type { get; set; } // FullTime, PartTime, Remote, etc.

        public string Status { get; set; } // Active, Closed, Hidden

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("Recruiter")]
        public int RecruiterId { get; set; }
        public Recruiter Recruiter { get; set; }

        public ICollection<JobApplication> Applications { get; set; }
    }
}


