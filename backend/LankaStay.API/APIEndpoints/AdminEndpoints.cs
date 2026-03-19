using LankaStay.API.Domain.Entities;
using LankaStay.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.API.APIEndpoints;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/admin").RequireAuthorization("AdminOnly");

        // Pending hotels
        group.MapGet("/hotels/pending", async (AppDbContext db) =>
        {
            var hotels = await db.Hotels
                .Where(h => !h.IsApproved)
                .Include(h => h.Owner)
                .Select(h => new
                {
                    h.Id, h.Name, h.Description, h.Location, h.ImageUrl, h.IsApproved, h.CreatedAt,
                    owner = new { h.Owner.Id, h.Owner.Name, h.Owner.Email }
                })
                .ToListAsync();
            return Results.Ok(hotels);
        });

        // Approve hotel
        group.MapPut("/hotels/{id}/approve", async (int id, AppDbContext db) =>
        {
            var hotel = await db.Hotels.FindAsync(id);
            if (hotel == null) return Results.NotFound();
            hotel.IsApproved = true;
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Hotel approved." });
        });

        // Reject hotel
        group.MapDelete("/hotels/{id}/reject", async (int id, AppDbContext db) =>
        {
            var hotel = await db.Hotels.FindAsync(id);
            if (hotel == null) return Results.NotFound();
            db.Hotels.Remove(hotel);
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Hotel rejected and removed." });
        });

        // Pending owner requests
        group.MapGet("/users/pending", async (AppDbContext db) =>
        {
            var users = await db.Users
                .Where(u => u.Role == UserRole.Owner && !u.IsApproved)
                .Select(u => new { u.Id, u.Name, u.Email, role = u.Role.ToString(), u.IsApproved, u.CreatedAt })
                .ToListAsync();
            return Results.Ok(users);
        });

        // Approve owner
        group.MapPut("/users/{id}/approve", async (int id, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user == null) return Results.NotFound();
            user.IsApproved = true;
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "User approved as Owner." });
        });

        // All users
        group.MapGet("/users", async (AppDbContext db) =>
        {
            var users = await db.Users
                .Select(u => new { u.Id, u.Name, u.Email, role = u.Role.ToString(), u.IsApproved, u.CreatedAt })
                .ToListAsync();
            return Results.Ok(users);
        });

        // Analytics
        group.MapGet("/analytics", async (AppDbContext db) =>
        {
            var totalBookings = await db.Bookings.CountAsync();
            var totalRevenue = await db.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled)
                .SumAsync(b => (decimal?)b.TotalPrice) ?? 0;
            var totalUsers = await db.Users.CountAsync(u => u.Role == UserRole.User);
            var totalHotels = await db.Hotels.CountAsync(h => h.IsApproved);
            var pendingHotels = await db.Hotels.CountAsync(h => !h.IsApproved);
            var pendingOwners = await db.Users.CountAsync(u => u.Role == UserRole.Owner && !u.IsApproved);

            return Results.Ok(new
            {
                totalBookings,
                totalRevenue,
                totalUsers,
                totalHotels,
                pendingHotels,
                pendingOwners
            });
        });
    }
}
