using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.DTO;

namespace CentralSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly CentralSyncDbContext _dbcontext;

        public ProjectsController(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        [HttpPost]
        public IActionResult AddProject([FromBody] CreateProjectRequestDto project)
        {
            var projectDomainModel = new Project()
            {
                Name = project.Name,
                Description = project.Description,

            };

            return Ok(projectDomainModel);
        }
    }
}
