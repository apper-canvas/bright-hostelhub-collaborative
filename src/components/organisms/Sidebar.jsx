import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import NavItem from "@/components/molecules/NavItem";

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Dashboard", to: "/", icon: "BarChart3" },
    { name: "Rooms", to: "/rooms", icon: "Bed" },
    { name: "Bookings", to: "/bookings", icon: "Calendar" },
    { name: "Guests", to: "/guests", icon: "Users" },
    { name: "Payments", to: "/payments", icon: "CreditCard" }
  ];

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <ApperIcon name="Building" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                HostelHub
              </h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              to={item.to}
              icon={item.icon}
              label={item.name}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Staff Member
              </p>
              <p className="text-xs text-gray-500 truncate">
                hostel@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Building" size={20} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                        HostelHub
                      </h1>
                      <p className="text-xs text-gray-500">Management System</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name} onClick={onClose}>
                      <NavItem
                        to={item.to}
                        icon={item.icon}
                        label={item.name}
                      />
                    </div>
                  ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Staff Member
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        hostel@example.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;