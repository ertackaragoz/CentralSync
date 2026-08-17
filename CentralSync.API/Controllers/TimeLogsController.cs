using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CentralSync.API.Controllers
{
    [Route("api/time-logs")]
    [ApiController]
    [Authorize]
    public class TimeLogsController : ControllerBase
    {
        private readonly ITaskTimeLogService _taskTimeLogService;

        public TimeLogsController(ITaskTimeLogService taskTimeLogService)
        {
            _taskTimeLogService = taskTimeLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTimeLogs(
            [FromQuery] Guid? userId,
            [FromQuery] Guid? taskId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var logs = await _taskTimeLogService.GetAllTimeLogsAsync(userId, taskId, startDate, endDate);
            return Ok(logs);
        }
    }
}