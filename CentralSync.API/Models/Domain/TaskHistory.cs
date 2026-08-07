using CentralSync.API.Models.Domain.Enums;
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

        public DateTime CreatedAt { get; set; }

        [ForeignKey(nameof(TaskId))]
        public ProjectTask Task { get; set; }

        [ForeignKey(nameof(ChangedByUserId))]
        public User ChangedByUser { get; set; }
    }
}
