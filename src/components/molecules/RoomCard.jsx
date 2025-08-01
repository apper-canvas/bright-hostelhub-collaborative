import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Guests from "@/components/pages/Guests";
import Badge from "@/components/atoms/Badge";
import { Card, CardContent } from "@/components/atoms/Card";

const RoomCard = ({ room, guests = [], onClick, onAction }) => {
  const statusConfig = {
    available: {
      color: "available",
      icon: "CheckCircle",
      borderColor: "border-l-emerald-500"
    },
    occupied: {
      color: "occupied",
      icon: "User",
      borderColor: "border-l-blue-500"
    },
    maintenance: {
      color: "maintenance",
      icon: "Wrench",
      borderColor: "border-l-orange-500"
    },
    cleaning: {
      color: "cleaning",
      icon: "Sparkles",
      borderColor: "border-l-yellow-500"
    }
  };

  const config = statusConfig[room.status] || statusConfig.available;
  const occupancyPercentage = (room.currentOccupancy / room.capacity) * 100;
  const roomGuests = guests.filter(guest => guest.roomId === room.id);

const getActionButtons = () => {
    switch (room.status) {
      case 'available':
        return room.currentOccupancy < room.capacity ? [
          { action: 'checkin', label: 'Check In', icon: 'UserPlus', variant: 'primary' }
        ] : [];
      case 'occupied':
        return [
          room.currentOccupancy < room.capacity && { action: 'checkin', label: 'Check In', icon: 'UserPlus', variant: 'primary' },
          { action: 'checkout', label: 'Check Out', icon: 'UserMinus', variant: 'secondary' }
        ].filter(Boolean);
      case 'maintenance':
        return [
          { action: 'available', label: 'Mark Available', icon: 'CheckCircle', variant: 'success' }
        ];
      case 'cleaning':
        return [
          { action: 'available', label: 'Mark Available', icon: 'CheckCircle', variant: 'success' }
        ];
      default:
        return [];
    }
  };

  const getStatusActions = () => {
    if (room.status === 'available' || room.status === 'occupied') {
      return [
        { action: 'maintenance', label: 'Maintenance', icon: 'Wrench', variant: 'ghost' },
        { action: 'cleaning', label: 'Cleaning', icon: 'Sparkles', variant: 'ghost' }
      ];
    }
    return [];
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-l-4 ${config.borderColor} hover:shadow-card-hover`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">Room {room.number}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {room.type} • Floor {room.floor}
              </p>
            </div>
            <Badge variant={config.color}>
              <ApperIcon name={config.icon} size={12} className="mr-1" />
              {room.status}
            </Badge>
          </div>

          {/* Occupancy Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Occupancy</span>
              <span className="font-medium">
                {room.currentOccupancy}/{room.capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  room.status === "available" ? "bg-emerald-500" :
                  room.status === "occupied" ? "bg-blue-500" :
                  room.status === "maintenance" ? "bg-orange-500" :
                  "bg-yellow-500"
                }`}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>

          {/* Guests */}
          {roomGuests.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Current Guests
              </p>
              <div className="space-y-1">
                {roomGuests.slice(0, 2).map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={12} className="text-primary-600" />
                      </div>
                      <span className="text-sm text-gray-700">{guest.name}</span>
                    </div>
                    {guest.checkInDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(guest.checkInDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
                {roomGuests.length > 2 && (
                  <p className="text-xs text-gray-500 pl-8">
                    +{roomGuests.length - 2} more
                  </p>
                )}
              </div>
            </div>
          ) : room.status === "available" && (
            <div className="flex items-center space-x-2 text-gray-500">
              <ApperIcon name="Plus" size={14} />
              <span className="text-sm">Ready for guests</span>
            </div>
          )}

          {/* Price */}
          <div className="pt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-900">
              ${room.pricePerNight}/night
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Primary Actions */}
            {getActionButtons().length > 0 && (
              <div className="flex flex-wrap gap-1">
                {getActionButtons().map(({ action, label, icon, variant }) => (
                  <button
                    key={action}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction && onAction(room, action);
                    }}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                      variant === 'primary' ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' :
                      variant === 'secondary' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                      variant === 'success' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                      'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ApperIcon name={icon} size={12} className="mr-1" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Status Actions */}
            {getStatusActions().length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
                {getStatusActions().map(({ action, label, icon }) => (
                  <button
                    key={action}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction && onAction(room, action);
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                  >
                    <ApperIcon name={icon} size={10} className="mr-1" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RoomCard;