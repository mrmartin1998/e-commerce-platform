/**
 * Utility functions for exporting data to various formats
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV formatted string
 */
export function arrayToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(header => `"${header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) {
        return '""';
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape quotes in strings
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file to user's device
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Name of the file (without extension)
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate filename with current date
 * @param {string} prefix - Prefix for the filename
 * @returns {string} Formatted filename with timestamp
 */
export function generateExportFilename(prefix) {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  return `${prefix}-${date}-${time}`;
}

/**
 * Format currency values for export
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency string
 */
export function formatCurrencyForExport(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
}

/**
 * Format date for export
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForExport(date) {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US') + ' ' + dateObj.toLocaleTimeString('en-US');
}

/**
 * Export sales data with proper formatting
 * @param {Array} salesData - Raw sales data from API
 * @returns {Promise} Download promise
 */
export async function exportSalesData(salesData) {
  const formattedData = salesData.map(item => ({
    'Date': formatDateForExport(item.date || `${item._id?.year}-${item._id?.month}-01`),
    'Revenue': formatCurrencyForExport(item.revenue),
    'Orders': item.orders || 0,
    'Average Order Value': formatCurrencyForExport(item.revenue / (item.orders || 1))
  }));

  const csvContent = arrayToCSV(formattedData);
  const filename = generateExportFilename('sales-data');
  downloadCSV(csvContent, filename);
}

/**
 * Export customer data with proper formatting
 * @param {Array} customerData - Raw customer data from API
 * @returns {Promise} Download promise
 */
export async function exportCustomerData(customerData) {
  const formattedData = customerData.map(customer => ({
    'Customer ID': customer._id,
    'Name': customer.name || 'N/A',
    'Email': customer.email,
    'Registration Date': formatDateForExport(customer.createdAt),
    'Total Orders': customer.totalOrders || 0,
    'Total Spent': formatCurrencyForExport(customer.totalSpent || 0),
    'Status': customer.status || 'Active'
  }));

  const csvContent = arrayToCSV(formattedData);
  const filename = generateExportFilename('customer-data');
  downloadCSV(csvContent, filename);
}

/**
 * Export inventory data with proper formatting
 * @param {Array} inventoryData - Raw inventory data from API
 * @returns {Promise} Download promise
 */
export async function exportInventoryData(inventoryData) {
  const formattedData = inventoryData.map(item => ({
    'Product ID': item._id,
    'Product Name': item.name,
    'Category': item.category || 'Uncategorized',
    'Current Stock': item.stock || 0,
    'Price': formatCurrencyForExport(item.price),
    'Stock Value': formatCurrencyForExport((item.stock || 0) * (item.price || 0)),
    'Status': item.status || 'Active',
    'Last Updated': formatDateForExport(item.updatedAt)
  }));

  const csvContent = arrayToCSV(formattedData);
  const filename = generateExportFilename('inventory-data');
  downloadCSV(csvContent, filename);
}
