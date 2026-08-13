using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CentralSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPatch("{userId:guid}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus([FromRoute]Guid userId)
        {
            var result = await _userService.ToggleUserStatusAsync(userId);
            if (!result) return NotFound("User not found.");
            return NoContent();
        }

        [HttpPatch("{userId:guid}/role")]
        public async Task<IActionResult> ChangeUserRole([FromRoute] Guid userId, [FromBody] ChangeUserRoleRequestDto request)
        {
            var result = await _userService.ChangeUserRoleAsync(userId, request.Role);
            if (!result) return NotFound("User not found.");
            return NoContent();
        }

    }
}
