"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const companyName = typeof params.companyName === 'string' 
    ? decodeURIComponent(params.companyName) 
    : '';
  
  useEffect(() => {
    console.log("Dashboard loaded for company:", companyName);
    console.log("Full params:", params);
    
    // Verify we have a company name
    if (!companyName) {
      console.error("No company name found in URL parameters");
    }
    
    setLoading(false);
  }, [companyName, params]);
  
  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard for {companyName}</h1>
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <p className="text-sm text-gray-700">Company: {companyName}</p>
        <p className="text-sm text-gray-700">Path: /inventory/{encodeURIComponent(companyName)}/dashboard</p>
      </div>
      
      {/* Rest of your dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Inventory Summary</h2>
          <p>Content coming soon...</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p>Content coming soon...</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <p>Content coming soon...</p>
        </div>
      </div>
    </div>
  );
}