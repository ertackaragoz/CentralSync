using CentralSync.API.Models.Domain;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Data
{
    public class CentralSyncDbContext: DbContext
    {
        public CentralSyncDbContext(DbContextOptions<CentralSyncDbContext> options):base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> Tasks { get; set; }
        public DbSet<Comment> Comments {  get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
        public DbSet<TaskHistory> TaskHistories { get; set; }
        public DbSet<TaskTimeLog> TaskTimeLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Project>().HasQueryFilter(p => !p.IsDeleted);
            modelBuilder.Entity<ProjectTask>().HasQueryFilter(t => !t.IsDeleted);

            modelBuilder.Entity<ProjectMember>()
                .HasIndex(pm => new { pm.ProjectId, pm.UserId })
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            var cascadeFKs = modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetForeignKeys())
                .Where(fk => !fk.IsOwnership && fk.DeleteBehavior == DeleteBehavior.Cascade);

            foreach (var fk in cascadeFKs)
            {
                fk.DeleteBehavior = DeleteBehavior.Restrict;
            }

            modelBuilder.Entity<ProjectTask>()
                .Property(t => t.EstimatedHours)
                .HasPrecision(18, 2);

            modelBuilder.Entity<TaskTimeLog>()
                .Property(t => t.Hours)
                .HasPrecision(18, 2);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added && entry.Metadata.FindProperty("CreatedAt") != null)
                {
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Added && entry.Metadata.FindProperty("JoinedAt") != null)
                {
                    entry.Property("JoinedAt").CurrentValue = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Modified && entry.Metadata.FindProperty("UpdatedAt") != null)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }

    }
}
