using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.DTO
{
    public class TaskHistoryDto
    {
        public Guid Id { get; set; }

        public Guid TaskId { get; set; }

        public Guid ChangedByUserId { get; set; }

        public TaskHistoryChangeType ChangeType { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
