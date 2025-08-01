import React, { useState } from "react";
import { format, differenceInDays } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { Modal, ModalHeader, ModalTitle, ModalContent } from "@/components/atoms/Modal";

const CheckOutModal = ({ room, guests, onCheckOut, onClose }) => {
  const [selectedGuestId, setSelectedGuestId] = useState(guests[0]?.id || '');
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [loading, setLoading] = useState(false);

  const selectedGuest = guests.find(g => g.id === parseInt(selectedGuestId));
  
  const calculateStayDetails = () => {
    if (!selectedGuest?.checkInDate) return { nights: 0, baseAmount: 0, totalAmount: 0 };
    
    const checkInDate = new Date(selectedGuest.checkInDate);
    const checkOutDate = new Date();
    const nights = Math.max(1, differenceInDays(checkOutDate, checkInDate));
    const baseAmount = nights * room.pricePerNight;
    const totalAmount = baseAmount + additionalCharges;
    
    return { nights, baseAmount, totalAmount };
  };

  const { nights, baseAmount, totalAmount } = calculateStayDetails();

  const handleCheckOut = async () => {
    if (!selectedGuest) return;
    
    setLoading(true);
    try {
      await onCheckOut(selectedGuest.id, {
        finalAmount: totalAmount,
        additionalCharges,
        nights
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>
          <ApperIcon name="UserMinus" size={20} className="mr-2" />
          Check Out - Room {room?.number}
        </ModalTitle>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-6">
          {/* Room Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Room {room?.number}</h3>
                <p className="text-sm text-blue-700 capitalize">
                  {room?.type} • Floor {room?.floor}
                </p>
              </div>
              <Badge variant="occupied">
                <ApperIcon name="User" size={12} className="mr-1" />
                {guests.length} Guest{guests.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Guest Selection */}
          {guests.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Guest to Check Out
              </label>
              <div className="space-y-2">
                {guests.map(guest => (
                  <label key={guest.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="guest"
                      value={guest.id}
                      checked={selectedGuestId === guest.id}
                      onChange={(e) => setSelectedGuestId(parseInt(e.target.value))}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{guest.name}</div>
                      <div className="text-sm text-gray-500">
                        {guest.email} • Check-in: {format(new Date(guest.checkInDate), 'MMM dd, yyyy')}
                      </div>
                      {guest.bedNumber && (
                        <div className="text-xs text-blue-600">Bed {guest.bedNumber}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Guest Details */}
          {selectedGuest && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Guest Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{selectedGuest.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{selectedGuest.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{selectedGuest.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">ID Number:</span>
                  <p className="font-medium">{selectedGuest.idNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Check-in Date:</span>
                  <p className="font-medium">
                    {format(new Date(selectedGuest.checkInDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Check-out Date:</span>
                  <p className="font-medium">
                    {format(new Date(), 'MMM dd, yyyy')}
                  </p>
                </div>
                {selectedGuest.bedNumber && (
                  <div>
                    <span className="text-gray-600">Bed Assignment:</span>
                    <p className="font-medium">Bed {selectedGuest.bedNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Calculation */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Number of nights:</span>
                <span className="font-medium">{nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Room rate per night:</span>
                <span className="font-medium">${room?.pricePerNight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base amount:</span>
                <span className="font-medium">${baseAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Additional charges:</span>
                <div className="flex items-center space-x-2">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCheckOut} disabled={loading || !selectedGuest}>
              {loading ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ApperIcon name="UserMinus" size={16} className="mr-2" />
                  Check Out Guest
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default CheckOutModal;