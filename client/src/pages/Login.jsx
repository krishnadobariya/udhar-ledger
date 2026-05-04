import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await authAPI.login({ mobileNumber, password });
            login(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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
                    <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Log in to manage your shop's ledger
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center gap-3">
                            <AlertCircle className="text-red-500 h-5 w-5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="input pl-10"
                                    placeholder="Enter mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="input pl-10"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account?</span>{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Create Shop Account
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
