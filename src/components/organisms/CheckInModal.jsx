import React, { useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Modal, ModalHeader, ModalTitle, ModalContent } from "@/components/atoms/Modal";

const CheckInModal = ({ room, onCheckIn, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    checkOutDate: '',
    bedNumber: room?.type === 'dorm' ? '' : null
  });
  const [loading, setLoading] = useState(false);

  const availableBeds = room?.type === 'dorm' 
    ? Array.from({ length: room.capacity }, (_, i) => i + 1)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.checkOutDate) return;
    if (room?.type === 'dorm' && !formData.bedNumber) return;

    setLoading(true);
    try {
      await onCheckIn(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>
          <ApperIcon name="UserPlus" size={20} className="mr-2" />
          Check In - Room {room?.number}
        </ModalTitle>
      </ModalHeader>

      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Room {room?.number}</h3>
                <p className="text-sm text-blue-700 capitalize">
                  {room?.type} • Floor {room?.floor} • ${room?.pricePerNight}/night
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Occupancy</p>
                <p className="font-medium text-blue-900">
                  {room?.currentOccupancy + 1}/{room?.capacity}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter guest name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="guest@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleChange('idNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="ID or Passport number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => handleChange('checkOutDate', e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Bed Assignment for Dorms */}
            {room?.type === 'dorm' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Assignment *
                </label>
                <select
                  value={formData.bedNumber}
                  onChange={(e) => handleChange('bedNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a bed</option>
                  {availableBeds.map(bed => (
                    <option key={bed} value={bed}>
                      Bed {bed}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Check-in Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Check-in Date:</span>
                <span>{format(new Date(), 'MMM dd, yyyy')}</span>
              </div>
              {formData.checkOutDate && (
                <div className="flex justify-between">
                  <span>Check-out Date:</span>
                  <span>{format(new Date(formData.checkOutDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Room Rate:</span>
                <span>${room?.pricePerNight}/night</span>
              </div>
              {room?.type === 'dorm' && formData.bedNumber && (
                <div className="flex justify-between">
                  <span>Bed Assignment:</span>
                  <span>Bed {formData.bedNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <ApperIcon name="UserPlus" size={16} className="mr-2" />
                  Check In Guest
                </>
              )}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CheckInModal;