using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CentralSync.API.Controllers
{
    [Authorize]
    [Route("api/tasks/{taskId:guid}/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetComments([FromRoute] Guid taskId)
        {
            var comments = await _commentService.GetByTaskIdAsync(taskId);
            return Ok(comments);
        }

        [HttpPost]
        public async Task<IActionResult> AddComment([FromRoute] Guid taskId, [FromBody] CreateCommentRequestDto request)
        {
            try
            {
                var comment = await _commentService.AddCommentAsync(taskId, request);
                return Ok(comment);
            }
            catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
        }

        [HttpPut("~/api/comments/{commentId:guid}")]
        public async Task<IActionResult> UpdateComment([FromRoute] Guid commentId, [FromBody] UpdateCommentRequestDto request)
        {
            try
            {
                var result = await _commentService.UpdateCommentAsync(commentId, request);
                if (!result) return NotFound("Comment not found.");

                return NoContent();
            }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
        }
        [HttpDelete("~/api/comments/{commentId:guid}")]
        public async Task<IActionResult> DeleteComment([FromRoute] Guid commentId)
        {
            try
            {
                var result = await _commentService.DeleteCommentAsync(commentId);
                if (!result) return NotFound("Comment not found.");

                return NoContent();
            }
            catch (UnauthorizedAccessException ex) { return StatusCode(403, ex.Message); }
        }
    }
}
