using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Services.Abstract;
using System.Security.Claims;

namespace CentralSync.API.Services.Concrete
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid UserId
        {
            get
            {
                var idClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                return idClaim != null ? Guid.Parse(idClaim) : Guid.Empty;
            }
        }

        public UserRole Role
        {
            get
            {
                var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
                return roleClaim != null ? Enum.Parse<UserRole>(roleClaim) : UserRole.TeamMember;
            }
        }

        public string FullName
        {
            get
            {
                return _httpContextAccessor.HttpContext?.User?.FindFirstValue("FullName") ?? "Unknown User";
            }
        }
    }
}