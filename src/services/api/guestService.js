import guestsData from "@/services/mockData/guests.json";

let guests = [...guestsData];

export const getAllGuests = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...guests];
};

export const getGuestById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const guest = guests.find(g => g.id === parseInt(id));
  if (!guest) {
    throw new Error("Guest not found");
  }
  return { ...guest };
};

export const createGuest = async (guestData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newGuest = {
    ...guestData,
    id: Math.max(...guests.map(g => g.id)) + 1
  };
  guests.push(newGuest);
  return { ...newGuest };
};

export const updateGuest = async (id, guestData) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  const index = guests.findIndex(g => g.id === parseInt(id));
  if (index === -1) {
    throw new Error("Guest not found");
  }
  guests[index] = { ...guests[index], ...guestData };
  return { ...guests[index] };
};

export const deleteGuest = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = guests.findIndex(g => g.id === parseInt(id));
  if (index === -1) {
    throw new Error("Guest not found");
  }
  guests.splice(index, 1);
  return true;
};

export const getGuestsByRoom = async (roomId) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return guests.filter(guest => guest.roomId === parseInt(roomId) && guest.status === 'checked-in')
               .map(guest => ({ ...guest }));
};

export const checkInGuest = async (guestData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newGuest = {
    ...guestData,
    id: Math.max(...guests.map(g => g.id), 0) + 1,
    checkInDate: new Date().toISOString(),
    status: 'checked-in'
  };
  guests.push(newGuest);
  return { ...newGuest };
};

export const checkOutGuest = async (id, checkoutData) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  const index = guests.findIndex(g => g.id === parseInt(id));
  if (index === -1) {
    throw new Error("Guest not found");
  }
  
  guests[index] = {
    ...guests[index],
    checkOutDate: new Date().toISOString(),
    status: 'checked-out',
    finalAmount: checkoutData.finalAmount,
    additionalCharges: checkoutData.additionalCharges,
    totalNights: checkoutData.nights
  };
  
  return { ...guests[index] };
};

export const getActiveGuests = async () => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return guests.filter(guest => guest.status === 'checked-in').map(guest => ({ ...guest }));
};

export const getGuestStayHistory = async (guestId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return guests.filter(guest => guest.id === parseInt(guestId)).map(guest => ({ ...guest }));
};

export const deleteGuest = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = guests.findIndex(g => g.id === parseInt(id));
  if (index === -1) {
    throw new Error("Guest not found");
  }
  guests.splice(index, 1);
  return true;
};