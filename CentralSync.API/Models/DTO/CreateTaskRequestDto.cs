using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Models.DTO
{
    public class CreateTaskRequestDto
    {
        public string Title { get; set; }

        public string? Description { get; set; }

        public Guid ProjectId { get; set; }

        public Guid? AssignedToUserId { get; set; }

        public ProjectTaskPriority Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public decimal? EstimatedHours { get; set; }

    }
}
