using CentralSync.API.Models.Domain;
using CentralSync.API.Models.DTO;
using CentralSync.API.Services.Abstract;

namespace CentralSync.API.Services.Concrete
{
    public class CommentService : ICommentService
    {
        public Task<CommentDto> AddCommentAsync(Comment comment, CreateCommentRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteCommentAsync(Guid commentId)
        {
            throw new NotImplementedException();
        }

        public Task<List<CommentDto>> GetByTaskIdAsync(Guid taskId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateCommentAsync(Comment comment, UpdateCommentRequestDto request)
        {
            throw new NotImplementedException();
        }
    }
}
