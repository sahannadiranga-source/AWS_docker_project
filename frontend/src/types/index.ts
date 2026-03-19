export interface Hotel {
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  isApproved: boolean;
  createdAt: string;
  roomCount?: number;
  minPrice?: number;
  owner?: { name: string };
  rooms?: Room[];
}

export interface Room {
  id: number;
  hotelId?: number;
  name: string;
  pricePerNight: number;
  capacity: number;
  imageUrl?: string;
  availableCount: number;
}

export interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  guestCount: number;
  totalPrice: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt: string;
  nights?: number;
  room: { id: number; name: string; pricePerNight: number; imageUrl?: string };
  hotel: { id: number; name: string; location: string; imageUrl?: string };
  user?: { id: number; name: string; email: string };
}

export interface OwnerAnalytics {
  hotelId: number;
  hotelName: string;
  totalBookings: number;
  totalRevenue: number;
}

export interface AdminAnalytics {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalHotels: number;
  pendingHotels: number;
  pendingOwners: number;
}
