import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Phone, Lock, User, Store, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        mobileNumber: '',
        password: '',
        shopName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.register(formData);
            login(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 transition-colors">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg mb-4 shadow-blue-500/20">
                        <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Start managing your shop's udhaar digitaly
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center gap-3">
                            <AlertCircle className="text-red-500 h-5 w-5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="name" type="text" required className="input pl-10" placeholder="Enter your name" value={formData.name} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Store className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="shopName" type="text" required className="input pl-10" placeholder="Enter shop name" value={formData.shopName} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="mobileNumber" type="text" required className="input pl-10" placeholder="Enter mobile number" value={formData.mobileNumber} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input name="password" type="password" required className="input pl-10" placeholder="Create password" value={formData.password} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account?</span>{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Log In</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
