using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Models.DTO
{
    public class ProjectMemberDto
    {
        public Guid Id { get; set; }

        public Guid ProjectId { get; set; }

        public Guid UserId { get; set; }

        public ProjectMemberRole Role { get; set; }

        public DateTime JoinedAt { get; set; }

        public bool IsActive { get; set; }
    }
}
