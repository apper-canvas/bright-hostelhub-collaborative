import React, { useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Modal, ModalHeader, ModalTitle, ModalContent } from "@/components/atoms/Modal";

const StatusChangeModal = ({ room, status, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const statusConfig = {
    maintenance: {
      title: 'Set Maintenance Status',
      icon: 'Wrench',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Mark this room as under maintenance. Guests will not be able to check in.',
      placeholder: 'Describe the maintenance required (e.g., plumbing repair, electrical work)'
    },
    cleaning: {
      title: 'Set Cleaning Status',
      icon: 'Sparkles',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      description: 'Mark this room as being cleaned. This will temporarily block new check-ins.',
      placeholder: 'Cleaning notes (e.g., deep clean, sanitization, routine housekeeping)'
    },
    available: {
      title: 'Mark Room Available',
      icon: 'CheckCircle',
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Mark this room as available for new guests.',
      placeholder: 'Optional notes about room readiness'
    }
  };

  const config = statusConfig[status] || statusConfig.available;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      await onConfirm(status, reason);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>
        <ModalTitle>
          <ApperIcon name={config.icon} size={20} className={`mr-2 ${config.color}`} />
          {config.title}
        </ModalTitle>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-6">
          {/* Room Info */}
          <div className={`${config.bg} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Room {room?.number}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {room?.type} • Floor {room?.floor}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-medium text-gray-900 capitalize">{room?.status}</p>
              </div>
            </div>
          </div>

          {/* Warning for occupied rooms */}
          {room?.currentOccupancy > 0 && status !== 'available' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <ApperIcon name="AlertTriangle" size={20} className="text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">Room Currently Occupied</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This room has {room.currentOccupancy} guest{room.currentOccupancy !== 1 ? 's' : ''} currently checked in. 
                    Please ensure guests are informed about the status change.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm">{config.description}</p>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason {status !== 'available' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required={status !== 'available'}
            />
            {status !== 'available' && reason.trim().length < 10 && (
              <p className="text-sm text-gray-500 mt-1">
                Please provide at least 10 characters describing the reason.
              </p>
            )}
          </div>

          {/* Confirmation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Confirmation</h4>
            <p className="text-sm text-gray-600">
              Room {room?.number} will be marked as <strong className="capitalize">{status}</strong>
              {status === 'available' ? ' and ready for new guests.' : ' and temporarily unavailable for new check-ins.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={loading || (status !== 'available' && reason.trim().length < 10)}
              variant={status === 'available' ? 'success' : 'primary'}
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ApperIcon name={config.icon} size={16} className="mr-2" />
                  Confirm {status === 'available' ? 'Available' : config.title.split(' ')[1]}
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default StatusChangeModal;