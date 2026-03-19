using System.Security.Claims;
using LankaStay.API.Domain.Entities;
using LankaStay.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.API.APIEndpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        // Public hotel endpoints
        app.MapGet("/api/hotels", async (AppDbContext db) =>
        {
            var hotels = await db.Hotels
                .Where(h => h.IsApproved)
                .Include(h => h.Rooms)
                .Select(h => new
                {
                    h.Id, h.Name, h.Description, h.Location, h.ImageUrl, h.CreatedAt,
                    roomCount = h.Rooms.Count,
                    minPrice = h.Rooms.Any() ? h.Rooms.Min(r => r.PricePerNight) : 0
                })
                .ToListAsync();
            return Results.Ok(hotels);
        });

        app.MapGet("/api/hotels/{id}", async (int id, AppDbContext db) =>
        {
            var hotel = await db.Hotels
                .Where(h => h.Id == id && h.IsApproved)
                .Include(h => h.Rooms)
                .Include(h => h.Owner)
                .Select(h => new
                {
                    h.Id, h.Name, h.Description, h.Location, h.ImageUrl, h.CreatedAt,
                    owner = new { h.Owner.Name },
                    rooms = h.Rooms.Select(r => new
                    {
                        r.Id, r.Name, r.PricePerNight, r.Capacity, r.ImageUrl, r.AvailableCount
                    })
                })
                .FirstOrDefaultAsync();

            return hotel == null ? Results.NotFound() : Results.Ok(hotel);
        });

        // Booking endpoints (require auth)
        var bookingGroup = app.MapGroup("/api/bookings").RequireAuthorization();

        // MapPost("") not "/" — avoids trailing-slash redirect that drops auth header
        bookingGroup.MapPost("", async (CreateBookingRequest req, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var room = await db.Rooms.Include(r => r.Hotel).FirstOrDefaultAsync(r => r.Id == req.RoomId);
            if (room == null) return Results.NotFound(new { message = "Room not found." });
            if (!room.Hotel.IsApproved) return Results.BadRequest(new { message = "Hotel is not available." });
            if (room.AvailableCount <= 0) return Results.BadRequest(new { message = "No rooms available." });

            // Normalize to UTC — Npgsql requires DateTimeKind.Utc
            var checkIn = DateTime.SpecifyKind(req.CheckInDate.Date, DateTimeKind.Utc);
            var checkOut = DateTime.SpecifyKind(req.CheckOutDate.Date, DateTimeKind.Utc);

            if (checkOut <= checkIn)
                return Results.BadRequest(new { message = "Check-out must be after check-in." });

            var nights = (checkOut - checkIn).Days;
            var totalPrice = room.PricePerNight * nights;

            var booking = new Booking
            {
                UserId = userId,
                RoomId = req.RoomId,
                CheckInDate = checkIn,
                CheckOutDate = checkOut,
                GuestName = req.GuestName,
                GuestEmail = req.GuestEmail,
                GuestCount = req.GuestCount,
                TotalPrice = totalPrice,
                Status = BookingStatus.Confirmed
            };

            room.AvailableCount--;
            db.Bookings.Add(booking);
            await db.SaveChangesAsync();

            return Results.Created($"/api/bookings/{booking.Id}", new
            {
                booking.Id, booking.CheckInDate, booking.CheckOutDate,
                booking.GuestName, booking.GuestEmail, booking.GuestCount,
                booking.TotalPrice, status = booking.Status.ToString(),
                booking.CreatedAt, nights,
                room = new { room.Id, room.Name, room.PricePerNight },
                hotel = new { room.Hotel.Id, room.Hotel.Name, room.Hotel.Location }
            });
        });

        bookingGroup.MapGet("/my", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var bookings = await db.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Room).ThenInclude(r => r.Hotel)
                .Select(b => new
                {
                    b.Id, b.CheckInDate, b.CheckOutDate, b.GuestName, b.GuestEmail,
                    b.GuestCount, b.TotalPrice, status = b.Status.ToString(), b.CreatedAt,
                    room = new { b.Room.Id, b.Room.Name, b.Room.PricePerNight, b.Room.ImageUrl },
                    hotel = new { b.Room.Hotel.Id, b.Room.Hotel.Name, b.Room.Hotel.Location, b.Room.Hotel.ImageUrl }
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
            return Results.Ok(bookings);
        });

        bookingGroup.MapDelete("/{id}/cancel", async (int id, ClaimsPrincipal principal, AppDbContext db) =>
        {
            var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var booking = await db.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return Results.NotFound();
            if (booking.UserId != userId) return Results.Forbid();
            if (booking.Status == BookingStatus.Cancelled)
                return Results.BadRequest(new { message = "Already cancelled." });

            booking.Status = BookingStatus.Cancelled;
            booking.Room.AvailableCount++;
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Booking cancelled." });
        });
    }

    public record CreateBookingRequest(
        int RoomId,
        DateTime CheckInDate,
        DateTime CheckOutDate,
        string GuestName,
        string GuestEmail,
        int GuestCount
    );
}
