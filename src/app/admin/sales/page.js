'use client';

import { useState, useEffect } from 'react';
import SalesOverview from '@/components/admin/dashboard/SalesOverview';

export default function SalesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Sales Analytics</h1>
      <SalesOverview />
    </div>
  );
} 