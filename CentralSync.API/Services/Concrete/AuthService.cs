using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CentralSync.API.Services.Concrete
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null) throw new InvalidOperationException("Email is already in use.");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = hashedPassword,
                Role = UserRole.TeamMember,
                IsActive = true,
                IsDeleted = false
            };

            await _userRepository.AddAsync(user);

            return GenerateAuthResponse(user);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null) throw new UnauthorizedAccessException("Invalid email or password.");

            // HASH'Lİ ŞİFREYİ DOĞRULUYORUZ
            bool isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isValidPassword) throw new UnauthorizedAccessException("Invalid email or password.");

            if (!user.IsActive) throw new UnauthorizedAccessException("User is inactive.");

            return GenerateAuthResponse(user);
        }

        private AuthResponseDto GenerateAuthResponse(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FullName", $"{user.FirstName} {user.LastName}")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

            return new AuthResponseDto
            {
                Token = jwtToken,
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString()
            };
        }
    }
}