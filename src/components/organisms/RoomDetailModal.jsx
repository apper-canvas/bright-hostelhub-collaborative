import React, { useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { Modal, ModalHeader, ModalTitle, ModalContent } from "@/components/atoms/Modal";

const RoomDetailModal = ({ room, guests = [], isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("info");

  if (!room) return null;

  const roomGuests = guests.filter(guest => guest.roomId === room.id);
  
  const statusConfig = {
    available: {
      color: "available",
      icon: "CheckCircle",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-800"
    },
    occupied: {
      color: "occupied",
      icon: "User",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800"
    },
    maintenance: {
      color: "maintenance",
      icon: "Wrench",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800"
    },
    cleaning: {
      color: "cleaning",
      icon: "Sparkles",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800"
    }
  };

  const config = statusConfig[room.status] || statusConfig.available;

  const tabs = [
    { id: "info", label: "Room Info", icon: "Info" },
    { id: "guests", label: "Guests", icon: "Users", count: roomGuests.length },
    { id: "history", label: "History", icon: "Clock" }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <ModalHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <ApperIcon name={config.icon} size={24} className={config.textColor} />
            </div>
            <div>
              <ModalTitle>Room {room.number}</ModalTitle>
              <p className="text-sm text-gray-600 capitalize">
                {room.type} room • Floor {room.floor}
              </p>
            </div>
          </div>
          <Badge variant={config.color}>
            <ApperIcon name={config.icon} size={12} className="mr-1" />
            {room.status}
          </Badge>
        </div>
      </ModalHeader>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <ApperIcon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      <ModalContent className="max-h-96 overflow-y-auto">
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Room Type</label>
                  <p className="text-sm text-gray-900 capitalize">{room.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Capacity</label>
                  <p className="text-sm text-gray-900">{room.capacity} guests</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Floor</label>
                  <p className="text-sm text-gray-900">Floor {room.floor}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Occupancy</label>
                  <p className="text-sm text-gray-900">{room.currentOccupancy} / {room.capacity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price per Night</label>
                  <p className="text-sm text-gray-900">${room.pricePerNight}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={config.color} className="text-xs">
                    <ApperIcon name={config.icon} size={10} className="mr-1" />
                    {room.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Occupancy Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Occupancy Rate</span>
                <span className="text-sm text-gray-900">
                  {Math.round((room.currentOccupancy / room.capacity) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    room.status === "available" ? "bg-emerald-500" :
                    room.status === "occupied" ? "bg-blue-500" :
                    room.status === "maintenance" ? "bg-orange-500" :
                    "bg-yellow-500"
                  }`}
                  style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "guests" && (
          <div className="space-y-4">
            {roomGuests.length > 0 ? (
              <div className="space-y-3">
                {roomGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                        <ApperIcon name="User" size={18} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{guest.name}</p>
                        <p className="text-sm text-gray-600">{guest.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(guest.checkIn), "MMM dd")} - {format(new Date(guest.checkOut), "MMM dd")}
                      </p>
                      <p className="text-xs text-gray-500">{guest.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ApperIcon name="Users" size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No guests currently</h3>
                <p className="text-gray-600">This room is available for new bookings.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="Clock" size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">History coming soon</h3>
            <p className="text-gray-600">Room history and maintenance logs will be available here.</p>
          </div>
        )}
      </ModalContent>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary">
          <ApperIcon name="Edit" size={16} className="mr-2" />
          Edit Room
        </Button>
      </div>
    </Modal>
  );
};

export default RoomDetailModal;