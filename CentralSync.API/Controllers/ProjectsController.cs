using Azure.Core;
using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Repositories.Abstract;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly ICurrentUserService _currentUserService;

        public ProjectsController(IProjectService projectService, ICurrentUserService currentUserService)
        {
            _projectService = projectService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProjects([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] ProjectStatus? status = null)
        {
            var projectsDto = await _projectService.GetAllProjectsAsync(page, pageSize, status);
            return Ok(projectsDto);
        }

        [HttpGet("{projectId:guid}")]
        public async Task<IActionResult> GetProjectById([FromRoute] Guid projectId)
        {
            var projectDto = await _projectService.GetProjectByIdAsync(projectId);
            if (projectDto == null) return NotFound();

            return Ok(projectDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequestDto request)
        {
            try
            {
                var projectDto = await _projectService.CreateProjectAsync(request, _currentUserService.UserId);
                return Ok(projectDto);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("{projectId:guid}/members")]
        public async Task<IActionResult> AddMemberToProject([FromRoute] Guid projectId, [FromBody] AddProjectMemberRequestDto request)
        {
            try
            {
                var projectMemberDto = await _projectService.AddMemberToProjectAsync(projectId, request);
                return Ok(projectMemberDto);
            }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        [HttpPut("{projectId:guid}")]
        public async Task<IActionResult> UpdateProject([FromRoute] Guid projectId, [FromBody] UpdateProjectRequestDto request)
        {
            try
            {
                var result = await _projectService.UpdateProjectAsync(projectId, request);
                if (result == false) return NotFound();
                return NoContent();
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }

            
        }

        [HttpPatch("{projectId:guid}/archive")]
        public async Task<IActionResult> ArchiveProject([FromRoute] Guid projectId, [FromBody] ArchiveProjectRequestDto request)
        {
            var result = await _projectService.ArchiveProjectAsync(projectId, request);
            if (result == false) return NotFound();

            return NoContent();
        }

        [HttpDelete("{projectId:guid}")]
        public async Task<IActionResult> DeleteProject([FromRoute] Guid projectId)
        {
            var result = await _projectService.DeleteProjectAsync(projectId);
            if (result == false) return NotFound("Project not found");

            return NoContent();
        }
    }
}
