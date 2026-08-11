using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.DTO
{
    public class TaskDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public string? Description { get; set; }

        public Guid ProjectId { get; set; }

        public Guid? AssignedToUserId { get; set; }

        public Guid CreatedByUserId { get; set; }

        public ProjectTaskStatus Status { get; set; }

        public ProjectTaskPriority Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public decimal? EstimatedHours { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }
    }
}
