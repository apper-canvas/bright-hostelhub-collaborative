import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  
const variants = {
    default: "bg-gray-100 text-gray-800",
    available: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    occupied: "bg-blue-100 text-blue-800 border border-blue-200",
    maintenance: "bg-orange-100 text-orange-800 border border-orange-200",
    cleaning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    pending: "bg-purple-100 text-purple-800 border border-purple-200",
    checkout: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };

  return (
    <span
      className={cn(baseClasses, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;