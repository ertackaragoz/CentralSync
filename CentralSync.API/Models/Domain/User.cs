using System.ComponentModel.DataAnnotations;
using CentralSync.API.Models.Domain.Enums;

namespace CentralSync.API.Models.Domain
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(50)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(255)]
        public string Email { get; set; }

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; }

        public UserRole Role { get; set; }

        public string? Department { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }

    }
}
