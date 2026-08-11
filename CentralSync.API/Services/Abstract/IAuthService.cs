using CentralSync.API.Models.DTO;

namespace CentralSync.API.Services.Abstract
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    }
}
