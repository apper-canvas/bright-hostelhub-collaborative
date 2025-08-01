// Note: Using 'id' field for consistency with existing data structure
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

export const getRoomsByStatus = async (status) => {
  await new Promise(resolve => setTimeout(resolve, 150));
  return rooms.filter(room => room.status === status).map(room => ({ ...room }));
};

export const updateRoomOccupancy = async (id, occupancyChange) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const index = rooms.findIndex(r => r.id === parseInt(id));
  if (index === -1) {
    throw new Error("Room not found");
  }
  
  const newOccupancy = Math.max(0, rooms[index].currentOccupancy + occupancyChange);
  const newStatus = newOccupancy === 0 ? 'available' : 
                   newOccupancy >= rooms[index].capacity ? 'occupied' : 
                   rooms[index].status;
  
  rooms[index] = {
    ...rooms[index],
    currentOccupancy: newOccupancy,
    status: newStatus
  };
  
  return { ...rooms[index] };
};

export const getAvailableBeds = async (roomId) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const room = rooms.find(r => r.id === parseInt(roomId));
  if (!room) {
    throw new Error("Room not found");
  }
  
  if (room.type !== 'dorm') {
    return [];
  }
  
  // Return available bed numbers (simplified - in real app would check guest assignments)
  const totalBeds = room.capacity;
  const occupiedBeds = room.currentOccupancy;
  const availableBeds = [];
  
  for (let i = 1; i <= totalBeds; i++) {
    if (i > occupiedBeds) {
      availableBeds.push(i);
    }
  }
  
  return availableBeds;
};