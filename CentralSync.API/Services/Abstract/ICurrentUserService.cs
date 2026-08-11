using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Services.Abstract
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        UserRole Role { get; }
        string FullName {  get; }

    }
}
