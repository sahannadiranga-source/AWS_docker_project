using LankaStay.API.Domain.Entities;
using LankaStay.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.API.Infrastructure.SeedData;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Users.AnyAsync())
        {
            var admin = new User
            {
                Name = "Lanka Stay Admin",
                Email = "admin@lankastay.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = UserRole.Admin,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(admin);
            await db.SaveChangesAsync();
        }

        if (!await db.Hotels.AnyAsync())
        {
            var owner = new User
            {
                Name = "Demo Owner",
                Email = "owner@lankastay.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123"),
                Role = UserRole.Owner,
                IsApproved = true,
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(owner);
            await db.SaveChangesAsync();

            var hotels = new List<Hotel>
            {
                new()
                {
                    Name = "Galle Fort Heritage Hotel",
                    Description = "A stunning colonial-era hotel nestled within the UNESCO-listed Galle Fort, offering breathtaking ocean views and authentic Sri Lankan hospitality.",
                    Location = "Galle Fort, Southern Province",
                    ImageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                    OwnerId = owner.Id,
                    IsApproved = true,
                    Rooms = new List<Room>
                    {
                        new() { Name = "Ocean View Suite", PricePerNight = 180, Capacity = 2, AvailableCount = 5, ImageUrl = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600" },
                        new() { Name = "Colonial Deluxe Room", PricePerNight = 120, Capacity = 2, AvailableCount = 8, ImageUrl = "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600" },
                        new() { Name = "Garden Cottage", PricePerNight = 95, Capacity = 3, AvailableCount = 4, ImageUrl = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600" }
                    }
                },
                new()
                {
                    Name = "Sigiriya Rock View Resort",
                    Description = "Luxury eco-resort at the foot of the iconic Sigiriya Rock Fortress. Wake up to panoramic views of the ancient citadel and lush jungle.",
                    Location = "Sigiriya, Central Province",
                    ImageUrl = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
                    OwnerId = owner.Id,
                    IsApproved = true,
                    Rooms = new List<Room>
                    {
                        new() { Name = "Rock View Villa", PricePerNight = 220, Capacity = 2, AvailableCount = 3, ImageUrl = "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600" },
                        new() { Name = "Jungle Bungalow", PricePerNight = 150, Capacity = 4, AvailableCount = 6, ImageUrl = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=600" }
                    }
                },
                new()
                {
                    Name = "Mirissa Beach Paradise",
                    Description = "Beachfront boutique hotel on the golden shores of Mirissa. Perfect for whale watching, surfing, and sunset cocktails.",
                    Location = "Mirissa Beach, Southern Province",
                    ImageUrl = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
                    OwnerId = owner.Id,
                    IsApproved = true,
                    Rooms = new List<Room>
                    {
                        new() { Name = "Beachfront Cabana", PricePerNight = 200, Capacity = 2, AvailableCount = 4, ImageUrl = "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600" },
                        new() { Name = "Sea Breeze Room", PricePerNight = 130, Capacity = 2, AvailableCount = 7, ImageUrl = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600" },
                        new() { Name = "Family Beach Suite", PricePerNight = 280, Capacity = 5, AvailableCount = 2, ImageUrl = "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600" }
                    }
                },
                new()
                {
                    Name = "Kandy Tea Estate Retreat",
                    Description = "Immerse yourself in Sri Lanka's tea culture at this elegant retreat surrounded by rolling tea plantations in the hill country.",
                    Location = "Kandy, Central Province",
                    ImageUrl = "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
                    OwnerId = owner.Id,
                    IsApproved = true,
                    Rooms = new List<Room>
                    {
                        new() { Name = "Planter's Suite", PricePerNight = 160, Capacity = 2, AvailableCount = 5, ImageUrl = "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600" },
                        new() { Name = "Tea Garden Room", PricePerNight = 110, Capacity = 2, AvailableCount = 9, ImageUrl = "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600" }
                    }
                }
            };

            db.Hotels.AddRange(hotels);
            await db.SaveChangesAsync();
        }
    }
}
