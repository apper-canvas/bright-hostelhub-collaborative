import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
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
// Search Bar Component
const SearchBar = ({ searchTerm, setSearchTerm, filters, setFilters }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = {
    bedType: [
      { value: 'all', label: 'All Types' },
      { value: 'dorm', label: 'Dorm' },
      { value: 'private', label: 'Private' }
    ],
    status: [
      { value: 'all', label: 'All Status' },
      { value: 'available', label: 'Available' },
      { value: 'occupied', label: 'Occupied' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'cleaning', label: 'Cleaning' }
    ],
    floor: [
      { value: 'all', label: 'All Floors' },
      { value: 1, label: 'Floor 1' },
      { value: 2, label: 'Floor 2' },
      { value: 3, label: 'Floor 3' }
    ]
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      bedType: 'all',
      status: 'all',
      floor: 'all'
    });
    setIsDropdownOpen(false);
  };

  const hasActiveFilters = searchTerm || filters.bedType !== 'all' || filters.status !== 'all' || filters.floor !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-card p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <ApperIcon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search rooms by number, type, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-3 flex items-center gap-2 min-w-[140px] justify-between"
          >
            <ApperIcon name="Filter" size={16} />
            Filters
            <ApperIcon 
              name={isDropdownOpen ? "ChevronUp" : "ChevronDown"} 
              size={16} 
            />
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Filter Rooms</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Bed Type Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bed Type
                  </label>
                  <select
                    value={filters.bedType}
                    onChange={(e) => handleFilterChange('bedType', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {filterOptions.bedType.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {filterOptions.status.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor
                  </label>
                  <select
                    value={filters.floor}
                    onChange={(e) => handleFilterChange('floor', e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {filterOptions.floor.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Search */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="px-3 py-3 text-gray-500 hover:text-gray-700"
          >
            <ApperIcon name="X" size={16} />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              <ApperIcon name="Search" size={12} />
              Search: "{searchTerm}"
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 hover:text-primary-900"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </div>
          )}
          {filters.bedType !== 'all' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <ApperIcon name="Bed" size={12} />
              Type: {filterOptions.bedType.find(opt => opt.value === filters.bedType)?.label}
              <button
                onClick={() => handleFilterChange('bedType', 'all')}
                className="ml-1 hover:text-blue-900"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </div>
          )}
          {filters.status !== 'all' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <ApperIcon name="CheckCircle" size={12} />
              Status: {filterOptions.status.find(opt => opt.value === filters.status)?.label}
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1 hover:text-green-900"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </div>
          )}
          {filters.floor !== 'all' && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              <ApperIcon name="Building" size={12} />
              Floor: {filters.floor}
              <button
                onClick={() => handleFilterChange('floor', 'all')}
                className="ml-1 hover:text-purple-900"
              >
                <ApperIcon name="X" size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Rooms = () => {
const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    bedType: 'all',
    status: 'all',
    floor: 'all'
  });
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
    // Text search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        room.number.toLowerCase().includes(searchLower) ||
        room.type.toLowerCase().includes(searchLower) ||
        room.status.toLowerCase().includes(searchLower) ||
        room.floor.toString().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Bed type filter
    if (filters.bedType !== 'all' && room.type !== filters.bedType) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && room.status !== filters.status) {
      return false;
    }

    // Floor filter
    if (filters.floor !== 'all' && room.floor !== filters.floor) {
      return false;
    }

    return true;
  });

  const statusCounts = {
    all: filteredRooms.length,
    available: filteredRooms.filter(r => r.status === 'available').length,
    occupied: filteredRooms.filter(r => r.status === 'occupied').length,
    maintenance: filteredRooms.filter(r => r.status === 'maintenance').length,
    cleaning: filteredRooms.filter(r => r.status === 'cleaning').length
  };
// Export functionality
  const [showExportMenu, setShowExportMenu] = useState(false);

  const prepareExportData = (rooms) => {
    return rooms.map(room => ({
      'Room Number': room.number,
      'Type': room.type.charAt(0).toUpperCase() + room.type.slice(1),
      'Floor': room.floor,
      'Capacity': room.capacity,
      'Current Occupancy': room.currentOccupancy,
      'Status': room.status.charAt(0).toUpperCase() + room.status.slice(1),
      'Price per Night': `$${room.pricePerNight}`,
      'Amenities': room.amenities ? room.amenities.join(', ') : '',
      'Occupancy Rate': `${Math.round((room.currentOccupancy / room.capacity) * 100)}%`
    }));
  };

  const exportToCSV = () => {
    const exportData = prepareExportData(filteredRooms);
    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rooms-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportMenu(false);
    toast.success(`Successfully exported ${filteredRooms.length} rooms to CSV`);
  };

  const exportToExcel = () => {
    const exportData = prepareExportData(filteredRooms);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // Room Number
      { wch: 10 }, // Type
      { wch: 8 },  // Floor
      { wch: 10 }, // Capacity
      { wch: 16 }, // Current Occupancy
      { wch: 12 }, // Status
      { wch: 14 }, // Price per Night
      { wch: 40 }, // Amenities
      { wch: 14 }  // Occupancy Rate
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `rooms-export-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    setShowExportMenu(false);
    toast.success(`Successfully exported ${filteredRooms.length} rooms to Excel`);
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

{/* Search Bar */}
      <SearchBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <ApperIcon name="Grid3x3" size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Total: </span>
            <span className="font-semibold text-gray-900">{statusCounts.all}</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="CheckCircle" size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Available: </span>
            <span className="font-semibold text-green-600">{statusCounts.available}</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="User" size={16} className="text-blue-500" />
            <span className="text-sm text-gray-600">Occupied: </span>
            <span className="font-semibold text-blue-600">{statusCounts.occupied}</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Wrench" size={16} className="text-orange-500" />
            <span className="text-sm text-gray-600">Maintenance: </span>
            <span className="font-semibold text-orange-600">{statusCounts.maintenance}</span>
          </div>
          <div className="flex items-center gap-2">
            <ApperIcon name="Sparkles" size={16} className="text-purple-500" />
            <span className="text-sm text-gray-600">Cleaning: </span>
            <span className="font-semibold text-purple-600">{statusCounts.cleaning}</span>
          </div>
        </div>
      </div>
{/* Room Grid */}
      <div className="bg-white rounded-lg shadow-card p-6">
        {/* Export Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Rooms ({filteredRooms.length})
          </h2>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Download" size={16} />
              Export Data
              <ApperIcon name="ChevronDown" size={14} />
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-10">
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ApperIcon name="FileText" size={14} />
                  Export as CSV
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ApperIcon name="FileSpreadsheet" size={14} />
                  Export as Excel
                </button>
              </div>
            )}
          </div>
        </div>

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