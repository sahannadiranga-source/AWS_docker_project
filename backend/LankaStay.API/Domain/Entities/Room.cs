namespace LankaStay.API.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public int HotelId { get; set; }
    public Hotel Hotel { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int Capacity { get; set; }
    public string? ImageUrl { get; set; }
    public int AvailableCount { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
