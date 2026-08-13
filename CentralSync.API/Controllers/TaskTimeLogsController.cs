using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CentralSync.API.Controllers
{
    [Route("api/tasks/{taskId:guid}/time-logs")]
    [ApiController]
    [Authorize]
    public class TaskTimeLogsController : ControllerBase
    {
        private readonly ITaskTimeLogService _taskTimeLogService;

        public TaskTimeLogsController(ITaskTimeLogService taskTimeLogService)
        {
            _taskTimeLogService = taskTimeLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTimeLogs([FromRoute]Guid taskId)
        {
            var logs = await _taskTimeLogService.GetTaskTimeLogsByTaskIdAsync(taskId);
            return Ok(logs);
        }

        [HttpPost]
        public async Task<IActionResult> AddTimeLog([FromRoute]Guid taskId, [FromBody]CreateTaskTimeLogRequestDto request)
        {
            var timeLog = await _taskTimeLogService.AddTaskTimeLogAsync(taskId, request);
            return Ok(timeLog);
        }
    }
}
