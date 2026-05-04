import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, User, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-500/20 shadow-lg">
                                <BookOpen className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Udhaar Ledger
                            </span>
                        </Link>
                        
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link 
                                to="/" 
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                                    isActive('/') 
                                    ? 'border-blue-500 text-gray-900' 
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link 
                                to="/customers" 
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                                    isActive('/customers') 
                                    ? 'border-blue-500 text-gray-900' 
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                <User className="w-4 h-4 mr-2" />
                                Customers
                            </Link>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.shopName}</span>
                        </div>
                        <button 
                            onClick={logout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="sm:hidden border-t border-gray-100 flex justify-around py-2 bg-white">
                <Link to="/" className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Home</span>
                </Link>
                <Link to="/customers" className={`flex flex-col items-center p-2 ${isActive('/customers') ? 'text-blue-600' : 'text-gray-500'}`}>
                    <User className="w-5 h-5" />
                    <span className="text-[10px] mt-1">Customers</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
