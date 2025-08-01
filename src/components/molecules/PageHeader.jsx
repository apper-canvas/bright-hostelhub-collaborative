import React from "react";
import ApperIcon from "@/components/ApperIcon";

const PageHeader = ({ title, subtitle, icon, children }) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
  const dateString = now.toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} size={20} className="text-primary-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">{timeString}</p>
          <p className="text-xs text-gray-500">{dateString}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageHeader;