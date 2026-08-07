using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.Domain
{
    public class TaskTimeLog
    {
        [Key]
        public Guid Id { get; set; }

        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }

        [Required]
        public decimal Hours { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime WorkDate { get; set; }

        public DateTime CreatedAt { get; set; }

        [ForeignKey(nameof(TaskId))]
        public ProjectTask Task { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }
    }
}
