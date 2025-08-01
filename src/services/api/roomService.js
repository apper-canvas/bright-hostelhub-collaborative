import roomsData from "@/services/mockData/rooms.json";

let rooms = [...roomsData];

export const getAllRooms = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...rooms];
};

export const getRoomById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  const room = rooms.find(r => r.id === parseInt(id));
  if (!room) {
    throw new Error("Room not found");
  }
  return { ...room };
};

export const createRoom = async (roomData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newRoom = {
    ...roomData,
    id: Math.max(...rooms.map(r => r.id)) + 1
  };
  rooms.push(newRoom);
  return { ...newRoom };
};

export const updateRoom = async (id, roomData) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  const index = rooms.findIndex(r => r.id === parseInt(id));
  if (index === -1) {
    throw new Error("Room not found");
  }
  rooms[index] = { ...rooms[index], ...roomData };
  return { ...rooms[index] };
};

export const deleteRoom = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = rooms.findIndex(r => r.id === parseInt(id));
  if (index === -1) {
    throw new Error("Room not found");
  }
  rooms.splice(index, 1);
  return true;
};