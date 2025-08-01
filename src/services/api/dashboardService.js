import dashboardData from "@/services/mockData/dashboard.json";

export const getDashboardMetrics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return { ...dashboardData };
};