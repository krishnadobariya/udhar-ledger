import React, { useState, useEffect } from 'react';
import { customerAPI, transactionAPI } from '../services/api';
import { Users, ArrowUpRight, ArrowDownLeft, UserPlus, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUdhaar: 0,
        totalCollected: 0,
        pending: 0
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [customerRes, statsRes] = await Promise.all([
                customerAPI.getAll(),
                transactionAPI.getStats()
            ]);

            const customersData = customerRes.data;
            setCustomers(customersData);
            
            const pending = customersData.reduce((acc, curr) => acc + (curr.totalCredit > 0 ? curr.totalCredit : 0), 0);
            const collected = customersData.reduce((acc, curr) => acc + (curr.totalCredit < 0 ? Math.abs(curr.totalCredit) : 0), 0);
            
            setStats({
                totalUdhaar: pending + collected,
                totalCollected: collected,
                pending: pending
            });

            // Process real stats data for the chart
            const chartFormatted = statsRes.data.map(item => ({
                name: new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' }),
                credit: item.credit,
                payment: item.payment
            }));
            
            setChartData(chartFormatted);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Overview of your shop's credit system</p>
                </div>
                <Link to="/customers" className="btn btn-primary inline-flex items-center gap-2 self-start md:self-auto">
                    <UserPlus className="w-4 h-4" />
                    Add Customer
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Udhaar Given" 
                    value={`₹${stats.pending.toLocaleString()}`} 
                    icon={<ArrowUpRight className="text-red-600" />} 
                    color="bg-red-50"
                    textColor="text-red-600"
                />
                <StatCard 
                    title="Total Collected" 
                    value={`₹${stats.totalCollected.toLocaleString()}`} 
                    icon={<ArrowDownLeft className="text-green-600" />} 
                    color="bg-green-50"
                    textColor="text-green-600"
                />
                <StatCard 
                    title="Total Customers" 
                    value={customers.length} 
                    icon={<Users className="text-blue-600" />} 
                    color="bg-blue-50"
                    textColor="text-blue-600"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card h-[400px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="text-blue-600 w-5 h-5" />
                        <h2 className="text-lg font-bold">Udhaar Trends (Last 7 Days)</h2>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="credit" stroke="#ef4444" fillOpacity={1} fill="url(#colorCredit)" strokeWidth={3} />
                                <Area type="monotone" dataKey="payment" stroke="#10b981" fillOpacity={1} fill="url(#colorPayment)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Top Pending Balances</h2>
                        <Link to="/customers" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="pb-3 px-4">Customer</th>
                                    <th className="pb-3 px-4 text-right">Balance</th>
                                    <th className="pb-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {customers.filter(c => c.totalCredit > 0).slice(0, 5).map((customer) => (
                                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{customer.name}</div>
                                                    <div className="text-xs text-gray-500">{customer.mobileNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="font-bold text-red-600">
                                                ₹{Math.abs(customer.totalCredit).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <Link 
                                                to={`/customers/${customer._id}`} 
                                                className="text-blue-600 hover:underline text-sm font-medium"
                                            >
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-500">
                                            No customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, textColor }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="card flex items-center gap-4 border-none shadow-md overflow-hidden relative"
    >
        <div className={`p-4 rounded-2xl ${color} relative z-10`}>
            {icon}
        </div>
        <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
        <div className={`absolute right-[-10px] top-[-10px] w-24 h-24 rounded-full opacity-10 ${color}`} />
    </motion.div>
);

export default Dashboard;
