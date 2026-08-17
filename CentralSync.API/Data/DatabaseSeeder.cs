using CentralSync.API.Data;
using CentralSync.API.Models.Domain;
using CentralSync.API.Models.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace CentralSync.API.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<CentralSyncDbContext>();

            if (!await context.Users.AnyAsync())
            {
                var adminUser = new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@centralsync.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Role = UserRole.Admin,
                    IsActive = true,
                    IsDeleted = false
                };

                var testUser = new User
                {
                    FirstName = "Ahmet",
                    LastName = "Yılmaz",
                    Email = "ahmet@centralsync.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ahmet123!"),
                    Role = UserRole.TeamMember,
                    IsActive = true,
                    IsDeleted = false
                };

                var testUser2 = new User
                {
                    FirstName = "Zeynep",
                    LastName = "Kaya",
                    Email = "zeynep@centralsync.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Zeynep123!"),
                    Role = UserRole.TeamMember,
                    IsActive = true,
                    IsDeleted = false
                };

                var testUser3 = new User
                {
                    FirstName = "Vedat",
                    LastName = "Gezen",
                    Email = "vedat@centralsync.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Vedat123!"),
                    Role = UserRole.TeamMember,
                    IsActive = true,
                    IsDeleted = false
                };
                await context.Users.AddRangeAsync(adminUser, testUser, testUser2, testUser3);
                await context.SaveChangesAsync();
            }
        }
    }
}