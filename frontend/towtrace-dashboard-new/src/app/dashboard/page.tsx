'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/auth-context';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Date range options type
type DateRangeOption = 
  | 'today' 
  | 'this_week' 
  | 'this_month' 
  | 'this_year' 
  | 'yesterday' 
  | 'last_week' 
  | 'last_month' 
  | 'last_year' 
  | 'custom';

// Dashboard layout types
type LayoutItem = {
  id: string;
  position: number;
  visible: boolean;
  width?: 'full' | 'half'; // 'full' for full width, 'half' for half width
  type: string; // Component type identifier
};

type DashboardLayout = {
  components: LayoutItem[];
};

// Draggable dashboard component
const DraggableItem = ({ id, children, index, moveItem, type }) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag({
    type: 'DASHBOARD_ITEM',
    item: { id, index, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: 'DASHBOARD_ITEM',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        border: '2px dashed #3b82f6',
        marginBottom: '1rem'
      }}
    >
      {children}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Define initial dashboard components
  const initialLayout: LayoutItem[] = [
    { id: 'quick-access', type: 'quickAccess', position: 0, visible: true, width: 'full' },
    { id: 'stats', type: 'stats', position: 1, visible: true, width: 'full' },
    { id: 'recent-activity', type: 'recentActivity', position: 2, visible: true, width: 'half' },
    { id: 'active-jobs', type: 'activeJobs', position: 3, visible: true, width: 'half' },
  ];
  
  // Load saved layout from localStorage or use initial layout
  const loadSavedLayout = (): LayoutItem[] => {
    if (typeof window !== 'undefined') {
      const savedLayout = localStorage.getItem('dashboardLayout');
      if (savedLayout) {
        try {
          return JSON.parse(savedLayout);
        } catch (error) {
          console.error('Error parsing saved dashboard layout:', error);
        }
      }
    }
    return initialLayout;
  };
  
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>({
    components: initialLayout
  });
  
  // Load saved layout on component mount
  useEffect(() => {
    setDashboardLayout({
      components: loadSavedLayout()
    });
  }, []);
  
  // Save dashboard layout
  const saveCustomization = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(dashboardLayout.components));
    setIsCustomizing(false);
  };
  
  // Reset dashboard to default layout
  const resetDashboard = () => {
    if (window.confirm('Are you sure you want to reset the dashboard to its default layout?')) {
      localStorage.removeItem('dashboardLayout');
      setDashboardLayout({
        components: initialLayout
      });
      setIsCustomizing(false);
    }
  };
  
  // Move item in the layout
  const moveItem = (dragIndex: number, hoverIndex: number) => {
    const sortedComponents = [...dashboardLayout.components].sort((a, b) => a.position - b.position);
    const dragItem = sortedComponents[dragIndex];
    
    // Create new array without the dragged item
    const newComponents = [...sortedComponents];
    newComponents.splice(dragIndex, 1);
    
    // Insert the dragged item at the new position
    newComponents.splice(hoverIndex, 0, dragItem);
    
    // Update positions
    const updatedComponents = newComponents.map((item, idx) => ({
      ...item,
      position: idx
    }));
    
    setDashboardLayout({
      ...dashboardLayout,
      components: updatedComponents
    });
  };
  
  // Toggle component visibility
  const toggleItemVisibility = (itemId: string) => {
    const newComponents = dashboardLayout.components.map(item => {
      if (item.id === itemId) {
        return { ...item, visible: !item.visible };
      }
      return item;
    });
    
    setDashboardLayout({
      ...dashboardLayout,
      components: newComponents
    });
  };
  
  // Change component width
  const toggleItemWidth = (itemId: string) => {
    const newComponents = dashboardLayout.components.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          width: item.width === 'full' ? 'half' : 'full' 
        };
      }
      return item;
    });
    
    setDashboardLayout({
      ...dashboardLayout,
      components: newComponents
    });
  };
  
  // Sample data
  const jobs = [
    { 
      id: 101, 
      client: "ABC Corp", 
      pickup: "123 Main St", 
      dropoff: "456 Oak Ave", 
      driver: "John Smith", 
      status: "In Progress",
      vehicles: 2,
      scheduled: "Today, 8:00 AM"
    },
    { 
      id: 102, 
      client: "XYZ Inc", 
      pickup: "789 Pine St", 
      dropoff: "321 Elm St", 
      driver: "Michael Brown", 
      status: "Scheduled",
      vehicles: 1,
      scheduled: "Today, 2:30 PM"
    },
    { 
      id: 103, 
      client: "Acme LLC", 
      pickup: "555 Cedar Rd", 
      dropoff: "777 Maple Ave", 
      driver: "Unassigned", 
      status: "Pending",
      vehicles: 3,
      scheduled: "Tomorrow, 9:15 AM"
    },
  ];
  
  // Recent activities with actual timestamps
  const activities = [
    {
      id: 1,
      description: "Vehicle #1235 completed delivery",
      time: "Today, 10:45 AM",
      type: "delivery",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 1))
    },
    {
      id: 2,
      description: "New job #104 created for client Delta Corp",
      time: "Today, 9:32 AM",
      type: "job_created",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 2))
    },
    {
      id: 3,
      description: "Driver Michael Brown started shift",
      time: "Today, 8:15 AM",
      type: "driver_shift",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 3))
    },
    {
      id: 4,
      description: "Pre-trip inspection completed for Vehicle #1237",
      time: "Today, 7:50 AM",
      type: "inspection",
      timestamp: new Date(new Date().setHours(new Date().getHours() - 4))
    },
    {
      id: 5,
      description: "Job #100 invoice generated and sent to billing",
      time: "Yesterday, 5:22 PM",
      type: "invoice",
      timestamp: new Date(new Date().setDate(new Date().getDate() - 1))
    }
  ];
  
  // Date range filtering for activities
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('today');
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const dateRangeDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle clicking outside the date range dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRangeDropdownRef.current && !dateRangeDropdownRef.current.contains(event.target as Node)) {
        setShowDateRangeDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter activities based on selected date range
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
    
    let filtered;
    
    switch (selectedDateRange) {
      case 'today':
        filtered = activities.filter(a => a.timestamp >= today);
        break;
      case 'yesterday':
        filtered = activities.filter(a => a.timestamp >= yesterday && a.timestamp < today);
        break;
      case 'this_week':
        filtered = activities.filter(a => a.timestamp >= thisWeekStart);
        break;
      case 'last_week':
        filtered = activities.filter(a => a.timestamp >= lastWeekStart && a.timestamp <= lastWeekEnd);
        break;
      case 'this_month':
        filtered = activities.filter(a => a.timestamp >= thisMonthStart);
        break;
      case 'last_month':
        filtered = activities.filter(a => a.timestamp >= lastMonthStart && a.timestamp <= lastMonthEnd);
        break;
      case 'this_year':
        filtered = activities.filter(a => a.timestamp >= thisYearStart);
        break;
      case 'last_year':
        filtered = activities.filter(a => a.timestamp >= lastYearStart && a.timestamp <= lastYearEnd);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999); // End of day
          filtered = activities.filter(a => a.timestamp >= start && a.timestamp <= end);
        } else {
          filtered = activities;
        }
        break;
      default:
        filtered = activities;
    }
    
    setFilteredActivities(filtered);
  }, [selectedDateRange, customStartDate, customEndDate]);
  
  // Format date range display text
  const getDateRangeDisplayText = (): string => {
    switch (selectedDateRange) {
      case 'today': return 'Today';
      case 'this_week': return 'This Week';
      case 'this_month': return 'This Month';
      case 'this_year': return 'This Year';
      case 'yesterday': return 'Yesterday';
      case 'last_week': return 'Last Week';
      case 'last_month': return 'Last Month';
      case 'last_year': return 'Last Year';
      case 'custom': return 'Custom Range';
      default: return 'Today';
    }
  };
  
  // Function to get the status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'badge badge-primary';
      case 'Scheduled':
        return 'badge badge-success';
      case 'Pending':
        return 'badge badge-warning';
      case 'Completed':
        return 'badge badge-success';
      case 'Cancelled':
        return 'badge badge-danger';
      default:
        return 'badge bg-gray-100 text-gray-800';
    }
  };
  
  // Function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return (
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        );
      case 'job_created':
        return (
          <div className="p-2 bg-green-100 rounded-full text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'driver_shift':
        return (
          <div className="p-2 bg-purple-100 rounded-full text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        );
      case 'inspection':
        return (
          <div className="p-2 bg-orange-100 rounded-full text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
        );
      case 'invoice':
        return (
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };
  
  // Get sorted components
  const sortedComponents = [...dashboardLayout.components]
    .filter(comp => comp.visible)
    .sort((a, b) => a.position - b.position);
  
  // Helper to render the appropriate component by type
  const renderComponent = (item: LayoutItem, index: number) => {
    const isFullWidth = item.width === 'full';
    const wrapperClasses = isFullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1';
    
    // Common UI elements when in customize mode
    const customizeControls = isCustomizing && (
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button 
          onClick={() => toggleItemWidth(item.id)}
          className="p-1 bg-white rounded-md shadow-sm text-gray-600 hover:text-gray-900 border border-gray-200"
          title={isFullWidth ? "Make half width" : "Make full width"}
        >
          {isFullWidth ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
        <button 
          onClick={() => toggleItemVisibility(item.id)}
          className="p-1 bg-white rounded-md shadow-sm text-gray-600 hover:text-gray-900 border border-gray-200"
          title="Hide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        </button>
      </div>
    );
    
    // Render the requested component
    let componentContent;
    switch (item.type) {
      case 'quickAccess':
        componentContent = (
          <div className="relative">
            {customizeControls}
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/dashboard/jobs/new" className="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Job
              </Link>
              
              <Link href="/dashboard/jobs/scan" className="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                </svg>
                Scan VIN
              </Link>
              
              {/* Only show Track Fleet button for admin and dispatch roles */}
              {(user?.role === 'admin' || user?.role === 'dispatch') && (
                <Link href="/dashboard/drivers" className="btn btn-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  Track Fleet
                </Link>
              )}
              
              {/* For drivers, show battery-friendly GPS tracking info */}
              {user?.role === 'driver' && (
                <div className="flex items-center bg-green-50 text-green-700 rounded-md px-3 py-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Battery-friendly GPS tracking active
                </div>
              )}
            </div>
          </div>
        );
        break;
      case 'stats':
        componentContent = (
          <div className="relative">
            {customizeControls}
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/dashboard/vehicles" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
                <div className="mb-4 md:mb-0">
                  <div className="text-gray-500 text-sm font-medium mb-1">Active Trucks</div>
                  <div className="text-3xl font-bold text-gray-900">12</div>
                </div>
                <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
              </Link>
              
              <Link href="/dashboard/drivers" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
                <div className="mb-4 md:mb-0">
                  <div className="text-gray-500 text-sm font-medium mb-1">Available Drivers</div>
                  <div className="text-3xl font-bold text-gray-900">8</div>
                </div>
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </Link>
              
              <Link href="/dashboard/jobs" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
                <div className="mb-4 md:mb-0">
                  <div className="text-gray-500 text-sm font-medium mb-1">Jobs Today</div>
                  <div className="text-3xl font-bold text-gray-900">15</div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                </div>
              </Link>
              
              <Link href="/dashboard/jobs?status=completed" className="card flex flex-col md:flex-row items-center justify-between p-6 card-hover no-underline">
                <div className="mb-4 md:mb-0">
                  <div className="text-gray-500 text-sm font-medium mb-1">Completed Jobs</div>
                  <div className="text-3xl font-bold text-gray-900">42</div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        );
        break;
      case 'recentActivity':
        componentContent = (
          <div className="relative card p-6">
            {customizeControls}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <div className="flex items-center space-x-2">
                <div className="relative" ref={dateRangeDropdownRef}>
                  <button
                    onClick={() => setShowDateRangeDropdown(!showDateRangeDropdown)}
                    className="flex items-center space-x-1 text-sm text-gray-700 bg-gray-100 rounded-md px-3 py-1 hover:bg-gray-200"
                  >
                    <span>{getDateRangeDisplayText()}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showDateRangeDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => { setSelectedDateRange('today'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'today' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => { setSelectedDateRange('this_week'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'this_week' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          This Week
                        </button>
                        <button
                          onClick={() => { setSelectedDateRange('this_month'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'this_month' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          This Month
                        </button>
                        <button
                          onClick={() => { setSelectedDateRange('this_year'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'this_year' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          This Year
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => { setSelectedDateRange('yesterday'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'yesterday' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          Yesterday
                        </button>
                        <button
                          onClick={() => { setSelectedDateRange('last_week'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'last_week' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          Last Week
                        </button>
                        <button
                          onClick={() => { setSelectedDateRange('last_month'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'last_month' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          Last Month
                        </button>
                        <button
                          onClick={() => { setSelectedDateRange('last_year'); setShowDateRangeDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'last_year' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          Last Year
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => setSelectedDateRange('custom')}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedDateRange === 'custom' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                        >
                          Custom Range
                        </button>
                        
                        {selectedDateRange === 'custom' && (
                          <div className="px-4 py-2 space-y-2">
                            <div>
                              <label className="block text-xs text-gray-500">Start Date</label>
                              <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full mt-1 text-sm border border-gray-300 rounded-md px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">End Date</label>
                              <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full mt-1 text-sm border border-gray-300 rounded-md px-2 py-1"
                              />
                            </div>
                            <button
                              onClick={() => setShowDateRangeDropdown(false)}
                              className="w-full mt-2 bg-primary-600 text-white rounded-md px-4 py-1 text-sm hover:bg-primary-700"
                            >
                              Apply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <Link href="/dashboard/activity" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    {getActivityIcon(activity.type)}
                    <div>
                      <div className="text-gray-900 font-medium">{activity.description}</div>
                      <div className="text-gray-500 text-sm">{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No activities found for the selected time period
                </div>
              )}
            </div>
          </div>
        );
        break;
      case 'activeJobs':
        componentContent = (
          <div className="relative card p-6">
            {customizeControls}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Active Jobs</h2>
              <Link href="/dashboard/jobs" className="text-sm text-primary-600 hover:text-primary-700">
                View all jobs
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table-elegant">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Client</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id}>
                      <td className="font-medium">#{job.id}</td>
                      <td>{job.client}</td>
                      <td>
                        {job.driver === 'Unassigned' ? (
                          <span className="text-yellow-600 font-medium">{job.driver}</span>
                        ) : (
                          job.driver
                        )}
                      </td>
                      <td>
                        <span className={getStatusBadge(job.status)}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/dashboard/jobs/${job.id}`} className="text-primary-600 hover:text-primary-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        break;
      default:
        componentContent = <div>Unknown component type</div>;
    }
    
    if (isCustomizing) {
      return (
        <DraggableItem 
          key={item.id} 
          id={item.id} 
          index={index} 
          moveItem={moveItem}
          type={item.type}
        >
          <div className={wrapperClasses}>
            {componentContent}
          </div>
        </DraggableItem>
      );
    }
    
    return (
      <div key={item.id} className={wrapperClasses}>
        {componentContent}
      </div>
    );
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="animate-fade-in">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h2>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your fleet today
            </p>
          </div>
          
          <div>
            {isCustomizing ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomization}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Save Layout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsCustomizing(true)}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                  </svg>
                  <span>Customize Dashboard</span>
                </button>
                
                <button
                  onClick={resetDashboard}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  title="Reset to default layout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {isCustomizing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center text-blue-700 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <span className="font-semibold">Customize Dashboard Layout</span>
            </div>
            <p className="text-blue-600 text-sm">
              Drag and drop dashboard components to rearrange them. Use the controls on each component to change its size or hide it.
            </p>
          </div>
        )}
        
        {/* Hidden components section (only shown in customize mode) */}
        {isCustomizing && dashboardLayout.components.filter(c => !c.visible).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Hidden Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dashboardLayout.components
                .filter(c => !c.visible)
                .map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {item.type === 'quickAccess' ? 'Quick Access' : 
                       item.type === 'recentActivity' ? 'Recent Activity' :
                       item.type === 'activeJobs' ? 'Active Jobs' : 
                       item.type === 'stats' ? 'Statistics' : item.type}
                    </span>
                    <button
                      onClick={() => toggleItemVisibility(item.id)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Show
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Dashboard content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedComponents.map((item, index) => renderComponent(item, index))}
        </div>
      </div>
    </DndProvider>
  );
}