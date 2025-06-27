namespace QuanLyTuyenDung.Models
{
    public class Company
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Industry { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? Description { get; set; }
        public string? Logo { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
