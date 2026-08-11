using CentralSync.API.Models.Domain.Enums;
using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CentralSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks([FromQuery] Guid? projectId, [FromQuery] Guid? assignedToUserId, [FromQuery] ProjectTaskStatus? status, [FromQuery] ProjectTaskPriority? priority, [FromQuery] DateTime? dueBefore, [FromQuery] DateTime? dueAfter, [FromQuery] string? sortBy, [FromQuery] string? sortDirection, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var tasks = await _taskService.GetAllTasksAsync(projectId, assignedToUserId, status, priority, dueBefore, dueAfter, sortBy, sortDirection, page, pageSize);
            return Ok(tasks);
        }

        [HttpGet("{taskId:guid}")]
        public async Task<IActionResult> GetTaskById([FromRoute] Guid taskId)
        {
            var task = await _taskService.GetTaskByIdAsync(taskId);
            if (task == null) return NotFound("Task not found.");

            return Ok(task);
        }

        [HttpGet("{taskId:guid}/histories")]
        public async Task<IActionResult> GetTaskHistories([FromRoute] Guid taskId)
        {
            var histories = await _taskService.GetTaskHistoriesAsync(taskId);
            return Ok(histories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequestDto request)
        {
            try
            {
                var task = await _taskService.CreateTaskAsync(request);
                return Ok(task);
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        [HttpPut("{taskId:guid}")]
        public async Task<IActionResult> UpdateTask([FromRoute] Guid taskId, [FromBody] UpdateTaskRequestDto request)
        {
            try
            {
                var result = await _taskService.UpdateTaskAsync(taskId, request);
                if (!result) return NotFound("Task not found.");

                return NoContent();
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
            catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
        }

        [HttpPatch("{taskId:guid}/status")]
        public async Task<IActionResult> UpdateTaskStatus([FromRoute] Guid taskId, [FromBody] ProjectTaskStatus status)
        {
            try
            {
                var result = await _taskService.UpdateTaskStatusAsync(taskId, status);
                if (!result) return NotFound("Task not found.");

                return NoContent();
            }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
        }

        [HttpDelete("{taskId:guid}")]
        public async Task<IActionResult> DeleteTask([FromRoute] Guid taskId)
        {
            try
            {
                var result = await _taskService.DeleteTaskAsync(taskId);
                if (!result) return NotFound("Task not found.");

                return NoContent();
            }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
        }
    }
}
