import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PageHeader from "@/components/molecules/PageHeader";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Modal } from "@/components/atoms/Modal";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { getAllBookings, createBooking, updateBooking, cancelBooking, confirmBooking } from "@/services/api/bookingService";
import { getAllRooms } from "@/services/api/roomService";
const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    specialRequests: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsData, roomsData] = await Promise.all([
        getAllBookings(),
        getAllRooms()
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guestName || !formData.guestEmail || !formData.roomId || 
        !formData.checkInDate || !formData.checkOutDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBooking) {
        await updateBooking(editingBooking.Id, formData);
        toast.success('Booking updated successfully');
      } else {
        await createBooking(formData);
        toast.success('Booking created successfully');
      }
      await loadData();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowNewBookingModal(false);
    setEditingBooking(null);
    setFormData({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      specialRequests: ''
    });
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setFormData({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      roomId: booking.roomId.toString(),
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      specialRequests: booking.specialRequests
    });
    setShowNewBookingModal(true);
  };

  const handleConfirm = async (bookingId) => {
    try {
      await confirmBooking(bookingId);
      toast.success('Booking confirmed successfully');
      await loadData();
    } catch (err) {
      toast.error('Failed to confirm booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        await loadData();
      } catch (err) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const getStatusBadgeProps = (status) => {
    switch (status) {
      case 'confirmed':
        return { variant: 'success', className: 'bg-emerald-100 text-emerald-800' };
      case 'pending':
        return { variant: 'warning', className: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled':
        return { variant: 'destructive', className: 'bg-red-100 text-red-800' };
      default:
        return { variant: 'secondary' };
    }
  };

  const calculateEstimatedPrice = () => {
    if (!formData.roomId || !formData.checkInDate || !formData.checkOutDate) return 0;
    
    const room = rooms.find(r => r.id === parseInt(formData.roomId));
    if (!room) return 0;
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return room.price * nights;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Manage reservations and booking calendar"
        icon="Calendar"
      />

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name, email, or room type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            onClick={() => setShowNewBookingModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <ApperIcon name="Plus" size={20} className="mr-2" />
            New Booking
          </Button>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          {filteredBookings.length === 0 ? (
            <Empty 
              icon="Calendar"
              title="No bookings found"
              subtitle={searchTerm || statusFilter !== 'all' ? "Try adjusting your search or filters" : "Create your first booking to get started"}
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Guest</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Room Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Check-in</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Check-out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.Id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.guestName}</div>
                        <div className="text-sm text-gray-500">{booking.guestEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{booking.roomType}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge {...getStatusBadgeProps(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      ${booking.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(booking)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ApperIcon name="Edit" size={16} />
                        </Button>
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleConfirm(booking.Id)}
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <ApperIcon name="Check" size={16} />
                          </Button>
                        )}
                        {booking.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(booking.Id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ApperIcon name="X" size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New/Edit Booking Modal */}
      <Modal
        isOpen={showNewBookingModal}
        onClose={handleCloseModal}
        title={editingBooking ? "Edit Booking" : "New Booking"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guest Name *
              </label>
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              required
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a room</option>
              {rooms.filter(room => room.status === 'available').map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.type === 'dorm' ? 'Dorm Bed' : 
                              room.type === 'shared' ? 'Shared Room' : 'Private Room'} 
                  (${room.price}/night)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Any special requests or notes..."
            />
          </div>

          {formData.roomId && formData.checkInDate && formData.checkOutDate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Estimated Total:</span>
                <span className="text-xl font-bold text-primary-600">
                  ${calculateEstimatedPrice().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {submitting ? 'Saving...' : editingBooking ? 'Update Booking' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bookings;