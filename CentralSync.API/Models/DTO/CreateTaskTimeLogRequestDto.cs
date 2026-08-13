using CentralSync.API.Models.Domain;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralSync.API.Models.DTO
{
    public class CreateTaskTimeLogRequestDto
    {
        public decimal Hours { get; set; }

        public string? Description { get; set; }

        public DateTime WorkDate { get; set; }
    }
}
