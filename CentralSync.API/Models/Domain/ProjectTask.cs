using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.Domain
{
    public class ProjectTask
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string? Description { get; set; }

        public Guid ProjectId { get; set; }

        public Guid? AssignedToUserId { get; set; }

        public Guid CreatedByUserId { get; set; }

        public ProjectTaskStatus Status { get; set; }

        public ProjectTaskPriority Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public decimal? EstimatedHours { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public Project Project { get; set; }

        [ForeignKey(nameof(AssignedToUserId))]
        public User AssignedToUser { get; set; }

        [ForeignKey(nameof(CreatedByUserId))]
        public User CreatedByUser { get; set; }

        public bool IsDeleted { get; set; }
    }

    public enum ProjectTaskStatus
    {
        Todo = 1,
        InProgress = 2,
        InReview = 3,
        Done = 4
    }

    public enum ProjectTaskPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
}
