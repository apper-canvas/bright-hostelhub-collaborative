import React from "react";
import PageHeader from "@/components/molecules/PageHeader";
import ApperIcon from "@/components/ApperIcon";

const Bookings = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Manage reservations and booking calendar"
        icon="Calendar"
      />

      <div className="bg-white rounded-lg shadow-card p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="Calendar" size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Booking Calendar & Reservations
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Comprehensive booking management system with calendar view, reservation processing, 
            group bookings, and automated confirmation workflows will be available here.
          </p>
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-6">
            <h4 className="font-semibold text-emerald-900 mb-2">Coming Soon Features:</h4>
            <ul className="text-sm text-emerald-800 space-y-1 text-left">
              <li>• Interactive booking calendar</li>
              <li>• Online reservation management</li>
              <li>• Group booking handling</li>
              <li>• Automated confirmation emails</li>
              <li>• Booking modification and cancellation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;