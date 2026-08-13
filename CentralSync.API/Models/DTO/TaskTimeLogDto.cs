using CentralSync.API.Models.Domain;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.DTO
{
    public class TaskTimeLogDto
    {
        public Guid Id { get; set; }

        public Guid TaskId { get; set; }

        public Guid UserId { get; set; }

        public string UserFullName { get; set; }

        public decimal Hours { get; set; }

        public string? Description { get; set; }

        public DateTime WorkDate { get; set; }

        public DateTime CreatedAt { get; set; }

    }
}
