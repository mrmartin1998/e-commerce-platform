import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// DaisyUI theme colors for professional charts
export const chartColors = {
  primary: 'hsl(var(--p))',
  secondary: 'hsl(var(--s))',
  accent: 'hsl(var(--a))',
  neutral: 'hsl(var(--n))',
  info: 'hsl(var(--in))',
  success: 'hsl(var(--su))',
  warning: 'hsl(var(--wa))',
  error: 'hsl(var(--er))',
  gradients: {
    primary: 'linear-gradient(135deg, hsl(var(--p)) 0%, hsl(var(--pf)) 100%)',
    secondary: 'linear-gradient(135deg, hsl(var(--s)) 0%, hsl(var(--sf)) 100%)',
  }
};

// Default chart options for consistent styling
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500'
        },
        color: 'hsl(var(--bc) / 0.8)' // Use theme text color with opacity
      }
    },
    tooltip: {
      backgroundColor: 'hsl(var(--b1))',
      titleColor: 'hsl(var(--bc))',
      bodyColor: 'hsl(var(--bc))',
      borderColor: 'hsl(var(--b3))',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: 'hsl(var(--bc) / 0.6)' // Lighter theme text color
      }
    },
    y: {
      grid: {
        color: 'hsl(var(--b3) / 0.3)' // Very subtle grid lines
      },
      ticks: {
        color: 'hsl(var(--bc) / 0.6)' // Lighter theme text color
      }
    }
  }
};

// Format currency for chart labels
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
