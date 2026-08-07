using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Models.DTO
{
    public class AddProjectMemberRequestDto
    {
        public Guid UserId { get; set; }
        public ProjectMemberRole Role { get; set; }
    }
}
