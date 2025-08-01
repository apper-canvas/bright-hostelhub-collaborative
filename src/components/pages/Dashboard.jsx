import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PageHeader from "@/components/molecules/PageHeader";
import MetricCard from "@/components/molecules/MetricCard";
import RoomCard from "@/components/molecules/RoomCard";
import RoomDetailModal from "@/components/organisms/RoomDetailModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { getDashboardMetrics } from "@/services/api/dashboardService";
import { getAllRooms } from "@/services/api/roomService";
import { getAllGuests } from "@/services/api/guestService";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [metricsData, roomsData, guestsData] = await Promise.all([
        getDashboardMetrics(),
        getAllRooms(),
        getAllGuests()
      ]);
      
      setMetrics(metricsData);
      setRooms(roomsData);
      setGuests(guestsData);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening at your hostel today."
        icon="BarChart3"
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Occupancy Rate"
          value={`${metrics?.occupancyRate || 0}%`}
          icon="TrendingUp"
          color="success"
          trend={5.2}
        />
        <MetricCard
          title="Today's Check-ins"
          value={metrics?.todayCheckIns || 0}
          icon="UserPlus"
          color="info"
        />
        <MetricCard
          title="Today's Check-outs"
          value={metrics?.todayCheckOuts || 0}
          icon="UserMinus"
          color="warning"
        />
        <MetricCard
          title="Available Rooms"
          value={metrics?.availableRooms || 0}
          icon="Bed"
          color="primary"
        />
      </div>

      {/* Revenue Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MetricCard
            title="Today's Revenue"
            value={`$${metrics?.todayRevenue || 0}`}
            icon="DollarSign"
            color="success"
            trend={12.5}
          />
        </div>
        <div className="lg:col-span-2">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-card p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg hover:from-primary-100 hover:to-primary-200 transition-all duration-200">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">New Booking</p>
                  <p className="text-sm text-gray-600">Add reservation</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-all duration-200">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Check-in Guest</p>
                  <p className="text-sm text-gray-600">Process arrival</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Status Grid */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Room Status</h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Cleaning</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              guests={guests}
              onClick={handleRoomClick}
            />
          ))}
        </div>
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={selectedRoom}
        guests={guests}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;