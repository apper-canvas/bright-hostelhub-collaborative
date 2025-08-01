import React from "react";
import PageHeader from "@/components/molecules/PageHeader";
import ApperIcon from "@/components/ApperIcon";

const Guests = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Guests"
        subtitle="Manage guest information and history"
        icon="Users"
      />

      <div className="bg-white rounded-lg shadow-card p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="Users" size={40} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Guest Database & History
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Complete guest management system with profiles, stay history, preferences, 
            and communication tools will be available here for personalized service.
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Coming Soon Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Guest profile management</li>
              <li>• Stay history and preferences</li>
              <li>• Communication and messaging</li>
              <li>• Loyalty program integration</li>
              <li>• Check-in/check-out processing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guests;