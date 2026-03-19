using System.Security.Claims;
using LankaStay.API.Application.Services;
using LankaStay.API.Domain.Entities;
using LankaStay.API.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LankaStay.API.APIEndpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (RegisterRequest req, AppDbContext db, TokenService tokenService) =>
        {
            if (await db.Users.AnyAsync(u => u.Email == req.Email))
                return Results.BadRequest(new { message = "Email already in use." });

            var user = new User
            {
                Name = req.Name,
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = UserRole.User, // Always default to User
                IsApproved = true
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Ok(new { token = tokenService.GenerateToken(user), user = MapUser(user) });
        });

        group.MapPost("/login", async (LoginRequest req, AppDbContext db, TokenService tokenService) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized();

            return Results.Ok(new { token = tokenService.GenerateToken(user), user = MapUser(user) });
        });

        group.MapPost("/request-owner", async (ClaimsPrincipal principal, AppDbContext db, TokenService tokenService) =>
        {
            var userId = int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var user = await db.Users.FindAsync(userId);
            if (user == null) return Results.NotFound();
            if (user.Role == UserRole.Owner) return Results.BadRequest(new { message = "Already an owner." });
            if (user.Role == UserRole.Admin) return Results.BadRequest(new { message = "Admins cannot request owner role." });

            user.Role = UserRole.Owner;
            user.IsApproved = false; // Needs admin approval
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Owner request submitted. Awaiting admin approval." });
        }).RequireAuthorization();
    }

    private static object MapUser(User u) => new
    {
        u.Id, u.Name, u.Email,
        role = u.Role.ToString(),
        u.IsApproved, u.CreatedAt
    };

    public record RegisterRequest(string Name, string Email, string Password);
    public record LoginRequest(string Email, string Password);
}
