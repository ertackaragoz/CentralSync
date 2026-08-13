using CentralSync.API.Models.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace CentralSync.API.Models.DTO
{
    public class UserDto
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Email { get; set; }

        public UserRole Role { get; set; }

        public string? Department { get; set; }

        public DateTime CreatedAt { get; set; }

        public bool IsActive { get; set; }
    }
}
