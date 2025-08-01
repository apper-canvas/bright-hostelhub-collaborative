import bookingsData from "@/services/mockData/bookings.json";
import { getAllRooms } from "@/services/api/roomService";

let bookings = [...bookingsData];

export const getAllBookings = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...bookings];
};

export const getBookingById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const booking = bookings.find(b => b.Id === parseInt(id));
  if (!booking) {
    throw new Error("Booking not found");
  }
  return { ...booking };
};

export const createBooking = async (bookingData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Calculate pricing
  const rooms = await getAllRooms();
  const selectedRoom = rooms.find(r => r.id === parseInt(bookingData.roomId));
  if (!selectedRoom) {
    throw new Error("Room not found");
  }

  const checkIn = new Date(bookingData.checkInDate);
  const checkOut = new Date(bookingData.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  const newBooking = {
    ...bookingData,
    Id: Math.max(...bookings.map(b => b.Id), 0) + 1,
    roomType: selectedRoom.type === 'dorm' ? 'Dorm Bed' : 
              selectedRoom.type === 'shared' ? 'Shared Room' : 'Private Room',
    pricePerNight: selectedRoom.price,
    nights: nights,
    totalAmount: selectedRoom.price * nights,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  return { ...newBooking };
};

export const updateBooking = async (id, bookingData) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  const index = bookings.findIndex(b => b.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Booking not found");
  }

  // Recalculate if dates or room changed
  if (bookingData.checkInDate || bookingData.checkOutDate || bookingData.roomId) {
    const rooms = await getAllRooms();
    const roomId = bookingData.roomId || bookings[index].roomId;
    const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
    
    if (selectedRoom) {
      const checkIn = new Date(bookingData.checkInDate || bookings[index].checkInDate);
      const checkOut = new Date(bookingData.checkOutDate || bookings[index].checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      bookingData.nights = nights;
      bookingData.totalAmount = selectedRoom.price * nights;
      bookingData.pricePerNight = selectedRoom.price;
      bookingData.roomType = selectedRoom.type === 'dorm' ? 'Dorm Bed' : 
                            selectedRoom.type === 'shared' ? 'Shared Room' : 'Private Room';
    }
  }

  bookings[index] = { ...bookings[index], ...bookingData };
  return { ...bookings[index] };
};

export const deleteBooking = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = bookings.findIndex(b => b.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Booking not found");
  }
  bookings.splice(index, 1);
  return true;
};

export const getBookingsByStatus = async (status) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return bookings.filter(booking => booking.status === status).map(booking => ({ ...booking }));
};

export const getBookingsByDateRange = async (startDate, endDate) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return bookings.filter(booking => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return (checkIn >= start && checkIn <= end) || 
           (checkOut >= start && checkOut <= end) ||
           (checkIn <= start && checkOut >= end);
  }).map(booking => ({ ...booking }));
};

export const confirmBooking = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = bookings.findIndex(b => b.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Booking not found");
  }
  
  bookings[index].status = 'confirmed';
  return { ...bookings[index] };
};

export const cancelBooking = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = bookings.findIndex(b => b.Id === parseInt(id));
  if (index === -1) {
    throw new Error("Booking not found");
  }
  
  bookings[index].status = 'cancelled';
  return { ...bookings[index] };
};