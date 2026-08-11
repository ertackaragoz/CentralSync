using CentralSync.API.Models.Domain;

namespace CentralSync.API.Repositories.Abstract
{
    public interface ICommentRepository
    {
        Task<List<Comment>> GetByTaskIdAsync(Guid taskId);
        Task<Comment?> GetByIdAsync(Guid id);
        Task<Comment> AddAsync(Comment comment);
        Task<Comment> UpdateAsync(Comment comment);
    }
}
