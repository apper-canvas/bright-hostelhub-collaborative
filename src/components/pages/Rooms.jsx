import React from "react";
import PageHeader from "@/components/molecules/PageHeader";
import ApperIcon from "@/components/ApperIcon";

const Rooms = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        subtitle="Manage room configurations and settings"
        icon="Bed"
      />

      <div className="bg-white rounded-lg shadow-card p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="Bed" size={40} className="text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Advanced Room Management
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Complete room configuration, pricing management, amenities tracking, and maintenance scheduling will be available here. 
            Set room types, capacity limits, and automated pricing rules.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
            <h4 className="font-semibold text-primary-900 mb-2">Coming Soon Features:</h4>
            <ul className="text-sm text-primary-800 space-y-1 text-left">
              <li>• Room type configuration (dorm, private, suite)</li>
              <li>• Dynamic pricing and seasonal rates</li>
              <li>• Amenities and features management</li>
              <li>• Maintenance scheduling and tracking</li>
              <li>• Room photos and virtual tours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;