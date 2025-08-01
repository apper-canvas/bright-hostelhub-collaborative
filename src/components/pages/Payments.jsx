import React from "react";
import PageHeader from "@/components/molecules/PageHeader";
import ApperIcon from "@/components/ApperIcon";

const Payments = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Track payments and financial reporting"
        icon="CreditCard"
      />

      <div className="bg-white rounded-lg shadow-card p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ApperIcon name="CreditCard" size={40} className="text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Tracking & Reports
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Comprehensive payment processing, financial reporting, invoice generation, 
            and revenue analytics will be available here for complete financial management.
          </p>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-900 mb-2">Coming Soon Features:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 text-left">
              <li>• Payment processing and refunds</li>
              <li>• Invoice generation and management</li>
              <li>• Financial reporting and analytics</li>
              <li>• Revenue tracking by period</li>
              <li>• Tax reporting and compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;