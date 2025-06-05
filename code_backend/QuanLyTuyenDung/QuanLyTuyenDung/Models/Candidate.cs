using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyTuyenDung.Models
{
    public class Candidate
    {
        [Key]
        public int CandidateID { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; }

        [Required, MaxLength(100)]
        public string LastName { get; set; }

        [Required, EmailAddress, MaxLength(100)]
        public string Email { get; set; }

        [Required, MaxLength(15)]
        public string Phone { get; set; }

        [Required, MaxLength(200)]
        public string Address { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required, MaxLength(10)]
        public string Gender { get; set; }

        // Thông tin học vấn (JSON)
        public string EducationJson { get; set; }
        public List<Education> Education
        {
            get => string.IsNullOrEmpty(EducationJson) ? new List<Education>() : JsonSerializer.Deserialize<List<Education>>(EducationJson);
            set => EducationJson = JsonSerializer.Serialize(value);
        }

        // Kinh nghiệm làm việc (JSON)
        public string ExperienceJson { get; set; }
        public List<Experience> Experience
        {
            get => string.IsNullOrEmpty(ExperienceJson) ? new List<Experience>() : JsonSerializer.Deserialize<List<Experience>>(ExperienceJson);
            set => ExperienceJson = JsonSerializer.Serialize(value);
        }

        // Kỹ năng (JSON)
        public string SkillsJson { get; set; }
        public List<string> Skills
        {
            get => string.IsNullOrEmpty(SkillsJson) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(SkillsJson);
            set => SkillsJson = JsonSerializer.Serialize(value);
        }

        // Ngôn ngữ (JSON)
        public string LanguagesJson { get; set; }
        public List<Language> Languages
        {
            get => string.IsNullOrEmpty(LanguagesJson) ? new List<Language>() : JsonSerializer.Deserialize<List<Language>>(LanguagesJson);
            set => LanguagesJson = JsonSerializer.Serialize(value);
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    [NotMapped]
    public class Education
    {
        public string Degree { get; set; }
        public string Major { get; set; }
        public string School { get; set; }
        public int GraduationYear { get; set; }
        public decimal? GPA { get; set; }
    }

    [NotMapped]
    public class Experience
    {
        public string Company { get; set; }
        public string Position { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Description { get; set; }
        public bool IsCurrentJob { get; set; }
    }

    [NotMapped]
    public class Language
    {
        public string LanguageName { get; set; }
        public string Proficiency { get; set; }
    }
}
