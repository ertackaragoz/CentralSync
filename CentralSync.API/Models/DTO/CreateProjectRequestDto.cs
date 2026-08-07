using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Models.DTO
{
    public class CreateProjectRequestDto
    {
        public string Name { get; set; }

        public string? Description { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public ProjectStatus Status { get; set; }

    }
}
