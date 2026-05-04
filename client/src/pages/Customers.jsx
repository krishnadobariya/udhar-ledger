import React, { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { Search, Plus, Loader2, Trash2, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', mobileNumber: '', address: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        let result = customers || [];
        if (searchTerm) {
            result = result.filter(c => 
                (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (c.mobileNumber || '').includes(searchTerm)
            );
        }
        if (filterType === 'due') {
            result = result.filter(c => (c.totalCredit || 0) > 0);
        } else if (filterType === 'settled') {
            result = result.filter(c => (c.totalCredit || 0) <= 0);
        }
        setFilteredCustomers(result);
    }, [searchTerm, filterType, customers]);

    const fetchCustomers = async () => {
        try {
            const { data } = await customerAPI.getAll();
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!newCustomer.name || !newCustomer.mobileNumber) {
            alert('Please fill all required fields');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await customerAPI.create(newCustomer);
            setCustomers([data, ...customers]);
            setShowAddModal(false);
            setNewCustomer({ name: '', mobileNumber: '', address: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error adding customer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await customerAPI.delete(id);
                setCustomers(customers.filter(c => c._id !== id));
            } catch (error) {
                alert('Error deleting customer');
            }
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500">Manage your customer database</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary inline-flex items-center gap-2 self-start md:self-auto shadow-lg shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4" />
                    New Customer
                </button>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Search by name or phone..."
                        className="input pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    {['all', 'due', 'settled'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                                filterType === type 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredCustomers.map((customer) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={customer._id}
                                className="card hover:shadow-xl transition-all relative group overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                                            {customer.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{customer.name}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Phone className="w-3 h-3" /> {customer.mobileNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(customer._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="space-y-2 mb-4 h-10">
                                    {customer.address && (
                                        <p className="text-xs text-gray-500 flex items-start gap-1 line-clamp-2">
                                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                                            {customer.address}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Balance</p>
                                        <p className={`font-bold ${(customer.totalCredit || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ₹{Math.abs(customer.totalCredit || 0).toLocaleString()}
                                            <span className="text-[10px] ml-1 uppercase">
                                                {(customer.totalCredit || 0) > 0 ? 'Due' : 'Advance'}
                                            </span>
                                        </p>
                                    </div>
                                    <Link 
                                        to={`/customers/${customer._id}`} 
                                        className="btn btn-outline py-1.5 px-3 text-xs"
                                    >
                                        View Details
                                    </Link>
                                </div>
                                <div className={`absolute right-[-10px] bottom-[-10px] w-20 h-20 rounded-full opacity-5 pointer-events-none ${(customer.totalCredit || 0) > 0 ? 'bg-red-600' : 'bg-green-600'}`} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence mode='wait'>
                {showAddModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10"
                        >
                            <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                            <form onSubmit={handleAddCustomer} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required className="input" placeholder="e.g. Rahul Kumar" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input required className="input" placeholder="10 digit number" value={newCustomer.mobileNumber} onChange={(e) => setNewCustomer({...newCustomer, mobileNumber: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                                    <textarea className="input" placeholder="Area or locality" rows="2" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline flex-1">Cancel</button>
                                    <button type="submit" disabled={submitting} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Customer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Customers;
