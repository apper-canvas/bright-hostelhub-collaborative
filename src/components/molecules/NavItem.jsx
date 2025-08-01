import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <motion.div
          className="flex items-center space-x-3 w-full"
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          <ApperIcon 
            name={icon} 
            size={18} 
            className={isActive ? "text-white" : "text-gray-500"} 
          />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-primary-100 text-primary-600"
            }`}>
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  );
};

export default NavItem;