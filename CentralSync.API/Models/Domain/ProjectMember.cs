using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.Domain
{
    public class ProjectMember
    {
        [Key]
        public Guid Id { get; set; }

        public Guid ProjectId { get; set; }

        public Guid UserId { get; set; }

        public ProjectMemberRole Role { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; }

        [ForeignKey(nameof(ProjectId))]
        public Project Project { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }
    }

    public enum ProjectMemberRole
    {
        Member = 1,
        Contributor = 2,
        Viewer = 3
    }
}
