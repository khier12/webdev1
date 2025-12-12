import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, List, BarChart3, Users, DollarSign, Calendar, 
  Search, Filter, ChevronDown, CheckCircle, XCircle, Clock, LogOut, Lock,
  Smartphone, Settings, ChevronLeft, ChevronRight, Save, Trash2, PlusCircle,
  FileText, TrendingUp
} from 'lucide-react';
import { Booking, BookingStatus, RepairIssue, TimeSlot } from '../types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Explicitly register components to ensure they work in all environments
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Props {
  bookings: Booking[];
  services: RepairIssue[];
  timeSlots: TimeSlot[];
  blockedDates: string[];
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onUpdateService: (service: RepairIssue) => void;
  onUpdateTimeSlot: (time: string, available: boolean) => void;
  onAddTimeSlot: (time: string) => void;
  onDeleteTimeSlot: (time: string) => void;
  onBlockDate: (date: string) => void;
  onUnblockDate: (date: string) => void;
  onLogout: () => void;
}

// Helper to safely extract price from string ranges (e.g. "₱3,500 - ₱5,000" -> 3500)
const getPrice = (priceStr: string) => {
  if (!priceStr || typeof priceStr !== 'string') return 0;
  if (priceStr.toLowerCase().includes('free')) return 0;
  // Remove commas
  const clean = priceStr.replace(/,/g, '');
  // Match first number sequence
  const match = clean.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : 0;
};

// Date Helpers
const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const AdminDashboard: React.FC<Props> = ({ 
  bookings, services, timeSlots, blockedDates,
  onUpdateStatus, onUpdateService, onUpdateTimeSlot, onAddTimeSlot, onDeleteTimeSlot, onBlockDate, onUnblockDate, onLogout 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'services' | 'availability'>('overview');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Report Filters
  const [reportService, setReportService] = useState<string>('All');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // New Block Date State
  const [newBlockDate, setNewBlockDate] = useState('');
  
  // New Time Slot State
  const [newTimeSlot, setNewTimeSlot] = useState('');

  // Editing Service State
  const [editingService, setEditingService] = useState<string | null>(null);
  const [tempServiceData, setTempServiceData] = useState<RepairIssue | null>(null);

  // Mock Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Hint: admin');
    }
  };

  // --- STATISTICS & CALCULATIONS ---

  const stats = useMemo(() => {
    const validBookings = bookings.filter(b => b.status !== 'Cancelled');
    
    const totalRevenue = validBookings.reduce((acc, curr) => {
        return acc + getPrice(curr.price);
    }, 0);
    
    const statusCounts = bookings.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const brandCounts = bookings.reduce((acc, curr) => {
        acc[curr.selectedBrand] = (acc[curr.selectedBrand] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, statusCounts, brandCounts, totalBookings: bookings.length };
  }, [bookings]);

  // Report Data Logic
  const reportData = useMemo(() => {
    return bookings.filter(b => {
      // 1. Service Filter
      if (reportService !== 'All' && b.selectedIssue !== reportService) return false;
      
      // 2. Date Filter
      const bookingDate = new Date(b.appointmentDate);
      
      if (reportType === 'daily') {
        return b.appointmentDate === reportDate;
      } 
      else if (reportType === 'weekly') {
        // Simple check: Same year and same week number
        const selectedDate = new Date(reportDate);
        return bookingDate.getFullYear() === selectedDate.getFullYear() && 
               getWeekNumber(bookingDate) === getWeekNumber(selectedDate);
      } 
      else if (reportType === 'monthly') {
        return b.appointmentDate.startsWith(reportMonth);
      }
      return true;
    });
  }, [bookings, reportService, reportType, reportDate, reportMonth]);

  const reportStats = useMemo(() => {
    const revenue = reportData.reduce((acc, curr) => curr.status !== 'Cancelled' ? acc + getPrice(curr.price) : acc, 0);
    return {
      revenue,
      count: reportData.length,
      completed: reportData.filter(b => b.status === 'Completed').length
    };
  }, [reportData]);

  const monthlyRevenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    bookings.forEach(b => {
      if (b.status === 'Cancelled') return;
      const d = new Date(b.appointmentDate);
      if (d.getFullYear() === currentYear) {
        data[d.getMonth()] += getPrice(b.price);
      }
    });

    return { labels: months, data };
  }, [bookings]);


  // --- CHART CONFIGS ---

  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [{
      label: 'Count',
      data: [
        stats.statusCounts['Pending'] || 0,
        stats.statusCounts['In Progress'] || 0,
        stats.statusCounts['Completed'] || 0,
        stats.statusCounts['Cancelled'] || 0,
      ],
      backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const monthlyChartData = {
    labels: monthlyRevenueData.labels,
    datasets: [{
      label: 'Monthly Revenue (Current Year)',
      data: monthlyRevenueData.data,
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Prevents chart from collapsing or growing too large
    plugins: { legend: { position: 'bottom' as const } },
  };


  // --- HANDLERS ---

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const currentBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleEditService = (service: RepairIssue) => {
      setEditingService(service.id);
      setTempServiceData(service);
  };

  const saveService = () => {
      if (tempServiceData) {
          onUpdateService(tempServiceData);
          setEditingService(null);
          setTempServiceData(null);
      }
  };

  const handleBlockDateSubmit = () => { if (newBlockDate) { onBlockDate(newBlockDate); setNewBlockDate(''); } };
  const handleAddTimeSlotSubmit = () => { if (newTimeSlot) { onAddTimeSlot(newTimeSlot); setNewTimeSlot(''); } };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-center mb-6">
                <div className="bg-slate-900 p-3 rounded-xl">
                    <Lock className="w-8 h-8 text-white" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Admin Portal</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    type="password" 
                    placeholder="Enter password (hint: admin)"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">Access Dashboard</button>
            </form>
            <button onClick={onLogout} className="w-full text-center mt-4 text-slate-500 hover:text-slate-800 text-sm">Return to Website</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="md:w-64 bg-slate-900 text-white flex flex-col md:h-screen sticky top-0 z-50">
        <div className="p-6 flex items-center justify-between md:block">
            <div className="flex items-center space-x-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg"><LayoutDashboard className="w-5 h-5" /></div>
                <span className="text-xl font-bold">SwiftFix Admin</span>
            </div>
        </div>
        <nav className="flex-1 px-4 pb-4 space-y-2 flex md:block overflow-x-auto md:overflow-visible">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'bookings', icon: List, label: 'Bookings' },
              { id: 'services', icon: Settings, label: 'Services' },
              { id: 'availability', icon: Clock, label: 'Availability' }
            ].map(item => (
              <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-colors whitespace-nowrap ${activeTab === item.id ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
              </button>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-800 hidden md:block">
            <button onClick={onLogout} className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
         <div className="md:hidden flex justify-end mb-4">
             <button onClick={onLogout} className="text-slate-500 text-sm flex items-center space-x-1"><LogOut className="w-4 h-4" /> <span>Logout</span></button>
         </div>

         {/* --- OVERVIEW TAB --- */}
         {activeTab === 'overview' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                 
                 {/* KPI Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <div className="flex justify-between items-start mb-4">
                             <div className="bg-green-100 p-2 rounded-lg"><span className="text-green-600 font-bold text-lg">₱</span></div>
                         </div>
                         <h3 className="text-slate-500 text-sm font-medium">Total Revenue</h3>
                         <p className="text-2xl font-bold text-slate-900">₱{stats.totalRevenue.toLocaleString()}</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <div className="bg-blue-100 p-2 rounded-lg w-fit mb-4"><Calendar className="w-6 h-6 text-blue-600" /></div>
                         <h3 className="text-slate-500 text-sm font-medium">Total Bookings</h3>
                         <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <div className="bg-yellow-100 p-2 rounded-lg w-fit mb-4"><Clock className="w-6 h-6 text-yellow-600" /></div>
                         <h3 className="text-slate-500 text-sm font-medium">Pending Repairs</h3>
                         <p className="text-2xl font-bold text-slate-900">{stats.statusCounts['Pending'] || 0}</p>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <div className="bg-purple-100 p-2 rounded-lg w-fit mb-4"><Users className="w-6 h-6 text-purple-600" /></div>
                         <h3 className="text-slate-500 text-sm font-medium">Completed Jobs</h3>
                         <p className="text-2xl font-bold text-slate-900">{stats.statusCounts['Completed'] || 0}</p>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Chart */}
                     <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> Annual Performance</h3>
                         <div className="h-64">
                             <Bar data={monthlyChartData} options={chartOptions} />
                         </div>
                     </div>
                     {/* Status Donut */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-slate-800 mb-6">Booking Status</h3>
                         <div className="h-64 flex justify-center">
                            {bookings.length > 0 ? <Doughnut data={statusChartData} options={chartOptions} /> : <p className="text-slate-400 self-center">No data</p>}
                         </div>
                     </div>
                 </div>

                 {/* DETAILED REPORTS SECTION */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center mb-4">
                            <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                            Detailed Reports
                        </h3>
                        
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Service Type</label>
                                <select 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    value={reportService}
                                    onChange={(e) => setReportService(e.target.value)}
                                >
                                    <option value="All">All Services</option>
                                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Period Type</label>
                                <select 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as any)}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Period</label>
                                {reportType === 'monthly' ? (
                                    <input type="month" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
                                ) : (
                                    <input type="date" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Report Summary */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                        <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Revenue</p>
                            <p className="text-xl font-bold text-green-600">₱{reportStats.revenue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Total Jobs</p>
                            <p className="text-xl font-bold text-slate-900">{reportStats.count}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Completed</p>
                            <p className="text-xl font-bold text-blue-600">{reportStats.completed}</p>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Service</th>
                                    <th className="px-6 py-3 font-medium text-right">Price</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reportData.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No records found for this period.</td></tr>
                                ) : (
                                    reportData.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-slate-600">{b.appointmentDate} <span className="text-xs text-slate-400 block">{b.appointmentTime}</span></td>
                                            <td className="px-6 py-3 font-medium text-slate-900">{b.customerName}</td>
                                            <td className="px-6 py-3 text-slate-600">{b.selectedIssue} <span className="text-xs text-slate-400 block">{b.selectedModel}</span></td>
                                            <td className="px-6 py-3 text-right font-medium">{b.price}</td>
                                            <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             </div>
         )}

         {/* --- BOOKINGS TAB --- */}
         {activeTab === 'bookings' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <h2 className="text-2xl font-bold text-slate-800">Booking Management</h2>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search customers..." 
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="pl-3 pr-8 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                 </div>

                 {/* Desktop Table View */}
                 <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                     <table className="w-full text-left">
                         <thead className="bg-slate-50 border-b border-slate-200">
                             <tr>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">ID</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Device & Issue</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {currentBookings.length === 0 ? (
                                 <tr>
                                     <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No bookings found.</td>
                                 </tr>
                             ) : (
                                currentBookings.map((booking) => (
                                 <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                     <td className="px-6 py-4 text-sm font-mono text-slate-400">#{booking.id.split('-')[1]}</td>
                                     <td className="px-6 py-4">
                                         <p className="font-medium text-slate-900">{booking.customerName}</p>
                                         <p className="text-xs text-slate-500">{booking.customerEmail}</p>
                                     </td>
                                     <td className="px-6 py-4">
                                         <p className="text-sm text-slate-900">{booking.selectedModel}</p>
                                         <p className="text-xs text-slate-500">{booking.selectedIssue}</p>
                                     </td>
                                     <td className="px-6 py-4 text-sm text-slate-600">
                                         {booking.appointmentDate}
                                         <br />
                                         <span className="text-xs text-slate-400">{booking.appointmentTime}</span>
                                     </td>
                                     <td className="px-6 py-4">
                                         <StatusBadge status={booking.status} />
                                     </td>
                                     <td className="px-6 py-4">
                                         <div className="flex space-x-2">
                                             {booking.status === 'Pending' && (
                                                <button onClick={() => onUpdateStatus(booking.id, 'In Progress')} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Start Repair"><Clock className="w-5 h-5" /></button>
                                             )}
                                             {booking.status === 'In Progress' && (
                                                <button onClick={() => onUpdateStatus(booking.id, 'Completed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Mark Complete"><CheckCircle className="w-5 h-5" /></button>
                                             )}
                                             {(booking.status !== 'Completed' && booking.status !== 'Cancelled') && (
                                                 <button onClick={() => onUpdateStatus(booking.id, 'Cancelled')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle className="w-5 h-5" /></button>
                                             )}
                                         </div>
                                     </td>
                                 </tr>
                             )))}
                         </tbody>
                     </table>
                 </div>

                 {/* Pagination */}
                 {totalPages > 1 && (
                     <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                         <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                         <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                         <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                     </div>
                 )}
             </div>
         )}

         {/* --- SERVICES TAB --- */}
         {activeTab === 'services' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-2xl font-bold text-slate-800">Manage Services</h2>
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                     <table className="w-full text-left">
                         <thead className="bg-slate-50 border-b border-slate-200">
                             <tr>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Service Name</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Price Range</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                                 <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {services.map((service) => (
                                 <tr key={service.id}>
                                     {editingService === service.id && tempServiceData ? (
                                         <>
                                             <td className="px-6 py-4"><input type="text" className="w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" value={tempServiceData.name} onChange={e => setTempServiceData({...tempServiceData, name: e.target.value})} /></td>
                                             <td className="px-6 py-4"><input type="text" className="w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" value={tempServiceData.priceRange} onChange={e => setTempServiceData({...tempServiceData, priceRange: e.target.value})} /></td>
                                              <td className="px-6 py-4"><input type="text" className="w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" value={tempServiceData.duration} onChange={e => setTempServiceData({...tempServiceData, duration: e.target.value})} /></td>
                                             <td className="px-6 py-4"><div className="flex space-x-2"><button onClick={saveService} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Save className="w-4 h-4" /></button><button onClick={() => setEditingService(null)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><XCircle className="w-4 h-4" /></button></div></td>
                                         </>
                                     ) : (
                                         <>
                                             <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                                             <td className="px-6 py-4 text-slate-600">{service.priceRange}</td>
                                             <td className="px-6 py-4 text-slate-500">{service.duration}</td>
                                             <td className="px-6 py-4"><button onClick={() => handleEditService(service)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Edit</button></td>
                                         </>
                                     )}
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
         )}

         {/* --- AVAILABILITY TAB --- */}
         {activeTab === 'availability' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-2xl font-bold text-slate-800">Availability Management</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-slate-800 mb-4">Daily Time Slots</h3>
                         <div className="flex space-x-2 mb-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                             <input type="time" className="flex-1 p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={newTimeSlot} onChange={(e) => setNewTimeSlot(e.target.value)} />
                             <button onClick={handleAddTimeSlotSubmit} disabled={!newTimeSlot} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-1"><PlusCircle className="w-4 h-4" /><span>Add</span></button>
                         </div>
                         <div className="space-y-3 max-h-[400px] overflow-y-auto">
                             {timeSlots.map(slot => (
                                 <div key={slot.time} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                     <span className="font-medium text-slate-700">{slot.time}</span>
                                     <div className="flex items-center space-x-3">
                                         <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={slot.available} onChange={(e) => onUpdateTimeSlot(slot.time, e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <button onClick={() => onDeleteTimeSlot(slot.time)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Slot"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                         <h3 className="text-lg font-bold text-slate-800 mb-4">Blocked Dates</h3>
                         <div className="flex space-x-2 mb-6">
                             <input type="date" className="flex-1 p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} />
                             <button onClick={handleBlockDateSubmit} disabled={!newBlockDate} className="bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-700 disabled:opacity-50">Block Date</button>
                         </div>
                         <div className="space-y-2">
                             {blockedDates.length === 0 && <p className="text-slate-500 text-sm">No specific dates blocked.</p>}
                             {blockedDates.map(date => (
                                 <div key={date} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                                     <span className="text-red-700 font-medium">{date}</span>
                                     <button onClick={() => onUnblockDate(date)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
         )}

      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    const styles = {
        'Pending': 'bg-yellow-100 text-yellow-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Completed': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-red-100 text-red-700',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>;
};