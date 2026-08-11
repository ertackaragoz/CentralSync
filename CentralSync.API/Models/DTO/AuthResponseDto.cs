namespace CentralSync.API.Models.DTO
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public Guid UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
    }
}
