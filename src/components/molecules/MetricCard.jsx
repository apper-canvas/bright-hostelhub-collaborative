import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { Card, CardContent } from "@/components/atoms/Card";

const MetricCard = ({ title, value, icon, trend, color = "primary" }) => {
  const colorMap = {
    primary: "from-primary-500 to-primary-600",
    success: "from-emerald-500 to-emerald-600",
    warning: "from-yellow-500 to-yellow-600",
    info: "from-blue-500 to-blue-600"
  };

  const iconBgMap = {
    primary: "bg-gradient-to-br from-primary-100 to-primary-200",
    success: "bg-gradient-to-br from-emerald-100 to-emerald-200",
    warning: "bg-gradient-to-br from-yellow-100 to-yellow-200",
    info: "bg-gradient-to-br from-blue-100 to-blue-200"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-baseline space-x-2">
                <span className={`text-3xl font-bold bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent`}>
                  {value}
                </span>
                {trend && (
                  <span className={`text-sm font-medium ${trend > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {trend > 0 ? "+" : ""}{trend}%
                  </span>
                )}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full ${iconBgMap[color]} flex items-center justify-center`}>
              <ApperIcon name={icon} size={24} className={`text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;