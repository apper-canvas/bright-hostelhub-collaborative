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