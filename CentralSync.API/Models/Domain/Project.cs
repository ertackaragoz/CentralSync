using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.Domain
{
    public class Project
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public ProjectStatus Status { get; set; }

        public Guid OwnerId { get; set; }

        public bool IsArchived { get; set; }

        public DateTime? ArchivedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey(nameof(OwnerId))]
        public User Owner { get; set; }

        public bool IsDeleted { get; set; }
    }

    public enum ProjectStatus
    {
        Planning = 1,
        Active = 2,
        OnHold = 3,
        Completed = 4,
        Cancelled = 5
    }
}
