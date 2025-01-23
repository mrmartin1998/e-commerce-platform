'use client';

import CustomerInsights from '@/components/admin/dashboard/CustomerInsights';

export default function CustomerAnalyticsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Customer Analytics</h1>
      <CustomerInsights />
    </div>
  );
} 