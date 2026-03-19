namespace LankaStay.API.Domain.Entities;

public enum UserRole { User, Owner, Admin }

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public bool IsApproved { get; set; } = true; // Users are auto-approved; Owners need admin approval
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Hotel> Hotels { get; set; } = new List<Hotel>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
