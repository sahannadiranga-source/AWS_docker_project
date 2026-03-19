using System.Security.Claims;
using LankaStay.API.Domain.Entities;
using LankaStay.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.API.APIEndpoints;

public static class OwnerEndpoints
{
    public static void MapOwnerEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/owner").RequireAuthorization("OwnerOrAdmin");

        // Create hotel
        group.MapPost("/hotels", async (CreateHotelRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var owner = await db.Users.FindAsync(ownerId);
            if (owner == null || !owner.IsApproved) return Results.Forbid();

            var hotel = new Hotel
            {
                Name = req.Name,
                Description = req.Description,
                Location = req.Location,
                ImageUrl = req.ImageUrl,
                OwnerId = ownerId,
                IsApproved = false
            };
            db.Hotels.Add(hotel);
            await db.SaveChangesAsync();
            return Results.Created($"/api/owner/hotels/{hotel.Id}", hotel);
        });

        // Update hotel
        group.MapPut("/hotels/{id}", async (int id, CreateHotelRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var hotel = await db.Hotels.FindAsync(id);
            if (hotel == null) return Results.NotFound();
            if (hotel.OwnerId != ownerId) return Results.Forbid();

            hotel.Name = req.Name;
            hotel.Description = req.Description;
            hotel.Location = req.Location;
            hotel.ImageUrl = req.ImageUrl;
            await db.SaveChangesAsync();
            return Results.Ok(hotel);
        });

        // Get owner's hotels
        group.MapGet("/hotels", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var hotels = await db.Hotels
                .Where(h => h.OwnerId == ownerId)
                .Include(h => h.Rooms)
                .Select(h => new
                {
                    h.Id, h.Name, h.Description, h.Location, h.ImageUrl, h.IsApproved, h.CreatedAt,
                    rooms = h.Rooms.Select(r => new { r.Id, r.Name, r.PricePerNight, r.Capacity, r.ImageUrl, r.AvailableCount })
                })
                .ToListAsync();
            return Results.Ok(hotels);
        });

        // Add room
        group.MapPost("/rooms", async (CreateRoomRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var hotel = await db.Hotels.FindAsync(req.HotelId);
            if (hotel == null || hotel.OwnerId != ownerId) return Results.Forbid();

            var room = new Room
            {
                HotelId = req.HotelId,
                Name = req.Name,
                PricePerNight = req.PricePerNight,
                Capacity = req.Capacity,
                ImageUrl = req.ImageUrl,
                AvailableCount = req.AvailableCount
            };
            db.Rooms.Add(room);
            await db.SaveChangesAsync();
            return Results.Created($"/api/owner/rooms/{room.Id}", room);
        });

        // Update room
        group.MapPut("/rooms/{id}", async (int id, CreateRoomRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var room = await db.Rooms.Include(r => r.Hotel).FirstOrDefaultAsync(r => r.Id == id);
            if (room == null) return Results.NotFound();
            if (room.Hotel.OwnerId != ownerId) return Results.Forbid();

            room.Name = req.Name;
            room.PricePerNight = req.PricePerNight;
            room.Capacity = req.Capacity;
            room.ImageUrl = req.ImageUrl;
            room.AvailableCount = req.AvailableCount;
            await db.SaveChangesAsync();
            return Results.Ok(room);
        });

        // Get owner bookings
        group.MapGet("/bookings", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var bookings = await db.Bookings
                .Include(b => b.Room).ThenInclude(r => r.Hotel)
                .Include(b => b.User)
                .Where(b => b.Room.Hotel.OwnerId == ownerId)
                .Select(b => new
                {
                    b.Id, b.CheckInDate, b.CheckOutDate, b.GuestName, b.GuestEmail,
                    b.GuestCount, b.TotalPrice, status = b.Status.ToString(), b.CreatedAt,
                    room = new { b.Room.Id, b.Room.Name, b.Room.PricePerNight },
                    hotel = new { b.Room.Hotel.Id, b.Room.Hotel.Name, b.Room.Hotel.Location },
                    user = new { b.User.Id, b.User.Name, b.User.Email }
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
            return Results.Ok(bookings);
        });

        // Owner analytics
        group.MapGet("/analytics", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var ownerId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var hotels = await db.Hotels
                .Where(h => h.OwnerId == ownerId)
                .Include(h => h.Rooms).ThenInclude(r => r.Bookings)
                .ToListAsync();

            var analytics = hotels.Select(h => new
            {
                hotelId = h.Id,
                hotelName = h.Name,
                totalBookings = h.Rooms.SelectMany(r => r.Bookings).Count(),
                totalRevenue = h.Rooms.SelectMany(r => r.Bookings)
                    .Where(b => b.Status != BookingStatus.Cancelled)
                    .Sum(b => b.TotalPrice)
            });

            return Results.Ok(analytics);
        });
    }

    public record CreateHotelRequest(string Name, string Description, string Location, string? ImageUrl);
    public record CreateRoomRequest(int HotelId, string Name, decimal PricePerNight, int Capacity, string? ImageUrl, int AvailableCount);
}
