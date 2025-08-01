import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PageHeader from "@/components/molecules/PageHeader";
import RoomCard from "@/components/molecules/RoomCard";
import CheckInModal from "@/components/organisms/CheckInModal";
import CheckOutModal from "@/components/organisms/CheckOutModal";
import StatusChangeModal from "@/components/organisms/StatusChangeModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { getAllRooms, updateRoom } from "@/services/api/roomService";
import { getAllGuests, createGuest, updateGuest } from "@/services/api/guestService";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalType, setModalType] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, guestsData] = await Promise.all([
        getAllRooms(),
        getAllGuests()
      ]);
      setRooms(roomsData);
      setGuests(guestsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoomAction = (room, action) => {
    setSelectedRoom(room);
    setModalType(action);
  };

  const handleCheckIn = async (guestData) => {
    try {
      const newGuest = await createGuest({
        ...guestData,
        roomId: selectedRoom.id,
        checkInDate: new Date().toISOString(),
        status: 'checked-in'
      });

      const updatedRoom = await updateRoom(selectedRoom.id, {
        currentOccupancy: selectedRoom.currentOccupancy + 1,
        status: selectedRoom.currentOccupancy + 1 >= selectedRoom.capacity ? 'occupied' : selectedRoom.status
      });

      setGuests(prev => [...prev, newGuest]);
      setRooms(prev => prev.map(room => 
        room.id === selectedRoom.id ? updatedRoom : room
      ));

      toast.success(`${guestData.name} successfully checked in to Room ${selectedRoom.number}`);
      setModalType(null);
      setSelectedRoom(null);
    } catch (err) {
      toast.error('Failed to check in guest');
    }
  };

  const handleCheckOut = async (guestId, checkoutData) => {
    try {
      const guest = guests.find(g => g.id === guestId);
      await updateGuest(guestId, {
        ...guest,
        checkOutDate: new Date().toISOString(),
        status: 'checked-out',
        finalAmount: checkoutData.finalAmount
      });

      const updatedRoom = await updateRoom(selectedRoom.id, {
        currentOccupancy: Math.max(0, selectedRoom.currentOccupancy - 1),
        status: selectedRoom.currentOccupancy - 1 === 0 ? 'available' : selectedRoom.status
      });

      setGuests(prev => prev.filter(g => g.id !== guestId));
      setRooms(prev => prev.map(room => 
        room.id === selectedRoom.id ? updatedRoom : room
      ));

      toast.success(`Guest successfully checked out from Room ${selectedRoom.number}`);
      setModalType(null);
      setSelectedRoom(null);
    } catch (err) {
      toast.error('Failed to check out guest');
    }
  };

  const handleStatusChange = async (status, reason) => {
    try {
      const updatedRoom = await updateRoom(selectedRoom.id, {
        status,
        lastStatusChange: new Date().toISOString(),
        statusReason: reason
      });

      setRooms(prev => prev.map(room => 
        room.id === selectedRoom.id ? updatedRoom : room
      ));

      toast.success(`Room ${selectedRoom.number} status updated to ${status}`);
      setModalType(null);
      setSelectedRoom(null);
    } catch (err) {
      toast.error('Failed to update room status');
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true;
    return room.status === filter;
  });

  const statusCounts = {
    all: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length
  };

  if (loading) return <Loading type="rooms" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Management"
        subtitle="Check-in, check-out, and manage room status"
        icon="Bed"
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-card p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Rooms', icon: 'Grid3x3' },
            { key: 'available', label: 'Available', icon: 'CheckCircle' },
            { key: 'occupied', label: 'Occupied', icon: 'User' },
            { key: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
            { key: 'cleaning', label: 'Cleaning', icon: 'Sparkles' }
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              variant={filter === key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(key)}
              className="relative"
            >
              <ApperIcon name={icon} size={16} className="mr-2" />
              {label}
              <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                {statusCounts[key]}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              guests={guests}
              onAction={handleRoomAction}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Search" size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600">Try adjusting your filter criteria</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType === 'checkin' && (
        <CheckInModal
          room={selectedRoom}
          onCheckIn={handleCheckIn}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === 'checkout' && (
        <CheckOutModal
          room={selectedRoom}
          guests={guests.filter(g => g.roomId === selectedRoom?.id)}
          onCheckOut={handleCheckOut}
          onClose={() => setModalType(null)}
        />
      )}

      {(modalType === 'maintenance' || modalType === 'cleaning') && (
        <StatusChangeModal
          room={selectedRoom}
          status={modalType}
          onConfirm={handleStatusChange}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default Rooms;