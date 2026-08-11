using CentralSync.API.Models.Domain;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.DTO
{
    public class CommentDto
    {
        public Guid Id { get; set; }

        public string Content { get; set; }

        public Guid TaskId { get; set; }

        public Guid UserId { get; set; }

        public string UserName { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
