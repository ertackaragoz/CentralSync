using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class MockCurrentUserService : ICurrentUserService
    {
        public Guid UserId => new Guid("07AB2AE5-84E1-4585-62C9-08DEF1D68828");
        public UserRole Role => UserRole.Admin;
    }
}
