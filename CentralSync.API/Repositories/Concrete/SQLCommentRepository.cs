using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Repositories.Concrete
{
    public class SQLCommentRepository : ICommentRepository
    {
        private readonly CentralSyncDbContext _dbcontext;

        public SQLCommentRepository(CentralSyncDbContext dbcontext)
        {
            _dbcontext = dbcontext;
        }
        public async Task<Comment> AddAsync(Comment comment)
        {
            await _dbcontext.Comments.AddAsync(comment);
            await _dbcontext.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment?> GetByIdAsync(Guid id)
        {
            return await _dbcontext.Comments.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<Comment>> GetByTaskIdAsync(Guid taskId)
        {
            return await _dbcontext.Comments
                .Include(c => c.User) 
                .Where(c => c.TaskId == taskId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Comment> UpdateAsync(Comment comment)
        {
            await _dbcontext.SaveChangesAsync();
            return comment;
        }
    }
}
