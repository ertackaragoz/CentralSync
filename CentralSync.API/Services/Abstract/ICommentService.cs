using CentralSync.API.Models.Domain;
using CentralSync.API.Models.DTO;

namespace CentralSync.API.Services.Abstract
{
    public interface ICommentService
    {
        Task<List<CommentDto>> GetByTaskIdAsync(Guid taskId);
        Task<CommentDto> AddCommentAsync(Comment comment, CreateCommentRequestDto request);
        Task<bool> UpdateCommentAsync(Comment comment, UpdateCommentRequestDto request);
        Task<bool> DeleteCommentAsync(Guid commentId);

    }
}
