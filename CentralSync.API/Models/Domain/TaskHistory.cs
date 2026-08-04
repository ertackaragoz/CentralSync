using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.Domain
{
    public class TaskHistory
    {
        [Key]
        public Guid Id { get; set; }

        public Guid TaskId { get; set; }

        public Guid ChangedByUserId { get; set; }

        public TaskHistoryChangeType ChangeType { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(TaskId))]
        public ProjectTask Task { get; set; }

        [ForeignKey(nameof(ChangedByUserId))]
        public User ChangedByUser { get; set; }
    }

    public enum TaskHistoryChangeType
    {
        StatusChanged = 1,
        AssignedUserChanged = 2,
        PriorityChanged = 3,
        TitleChanged = 4,
        DescriptionChanged = 5,
        TaskProjectChanged = 6,
        DueDateChanged = 7,
        EstimatedHoursChanged = 8,
        Updated = 9
    }
}
