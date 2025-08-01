import React from "react";
import { motion } from "framer-motion";

const Loading = ({ type = "dashboard" }) => {
  if (type === "dashboard") {
    return (
      <div className="space-y-6">
        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Room Grid Skeleton */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "rooms") {
    return (
      <div className="space-y-6">
        {/* Filter Bar Skeleton */}
        <div className="bg-white rounded-lg shadow-card p-4">
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Room Grid Skeleton */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-l-4 border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
                <div className="flex gap-1 pt-2">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full"
      />
    </div>
  );
};

export default Loading;