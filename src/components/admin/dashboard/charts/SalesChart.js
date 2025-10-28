'use client';

import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { defaultChartOptions, formatCurrency } from '@/lib/utils/chartConfig';

export default function SalesChart({ timeRange = '30' }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [themeColors, setThemeColors] = useState(null);

  // Get actual theme colors from computed styles and convert to RGB
  useEffect(() => {
    const getThemeColors = () => {
      if (typeof window === 'undefined') return null;
      
      // Create a temporary element to get computed color values
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position: absolute; visibility: hidden;';
      document.body.appendChild(tempDiv);
      
      // Apply theme colors and get computed RGB values
      tempDiv.className = 'text-primary bg-secondary border-base-content';
      const computedStyle = getComputedStyle(tempDiv);
      
      const primaryColor = computedStyle.color;
      const secondaryColor = computedStyle.backgroundColor;
      
      // Get text colors by applying different classes
      tempDiv.className = 'text-base-content';
      const textColor = getComputedStyle(tempDiv).color;
      
      tempDiv.className = 'text-base-content opacity-70';
      const textColorLight = getComputedStyle(tempDiv).color;
      
      tempDiv.className = 'border-base-300';
      const gridColor = getComputedStyle(tempDiv).borderColor;
      
      document.body.removeChild(tempDiv);
      
      return {
        primary: primaryColor,
        secondary: secondaryColor,
        textColor: '#f3f4f6', // Force light color for dark theme
        textColorLight: '#9ca3af', // Force lighter text for dark theme
        gridColor: gridColor
      };
    };
    
    // Set colors immediately and on theme changes
    setThemeColors(getThemeColors());
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setThemeColors(getThemeColors());
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (themeColors) {
      fetchSalesData();
    }
  }, [timeRange, themeColors]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/statistics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Process revenueByMonth data for chart
      const monthlyData = data.revenueByMonth || [];
      
      // Sort by date and prepare chart data
      const sortedData = monthlyData.sort((a, b) => {
        const dateA = new Date(a._id.year, a._id.month - 1);
        const dateB = new Date(b._id.year, b._id.month - 1);
        return dateA - dateB;
      });
      
      const labels = sortedData.map(item => {
        const date = new Date(item._id.year, item._id.month - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      });
      
      const revenueData = sortedData.map(item => item.revenue);
      const ordersData = sortedData.map(item => item.orders);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: themeColors?.primary || '#3b82f6',
            backgroundColor: themeColors?.primary ? `${themeColors.primary}20` : '#3b82f620',
            yAxisID: 'y',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Orders',
            data: ordersData,
            borderColor: themeColors?.secondary || '#10b981',
            backgroundColor: themeColors?.secondary ? `${themeColors.secondary}20` : '#10b98120',
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      });
      
    } catch (err) {
      console.error('Sales chart error:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af' // Force light color for dark theme
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)',
          color: '#f3f4f6', // Force light color for dark theme
          font: {
            size: 12,
            weight: '500'
          }
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          },
          color: '#9ca3af' // Force light color for dark theme
        },
        grid: {
          color: '#374151' // Force appropriate grid color for dark theme
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders',
          color: '#f3f4f6', // Force light color for dark theme
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#9ca3af' // Force light color for dark theme
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Sales Trends',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#f3f4f6' // Force light color for dark theme
      },
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          color: '#f3f4f6' // Force light color for dark theme - this is the key fix!
        }
      },
      tooltip: {
        backgroundColor: 'rgba(55, 65, 81, 0.95)',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        borderColor: '#6b7280',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-6 w-32"></div>
          <div className="skeleton h-8 w-24"></div>
        </div>
        <div className="skeleton h-64 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchSalesData} className="btn btn-sm btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.datasets[0].data.length) {
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
        <div className="text-center py-8">
          <p className="text-base-content/70">No sales data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Sales Trends</h3>
      </div>
      <div className="h-64 w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
