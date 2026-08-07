using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class MockCurrentUserService : ICurrentUserService
    {
        public Guid UserId => new Guid("4888F009-A0F1-4B39-3DEF-08DEF1D63B26");
    }
}
