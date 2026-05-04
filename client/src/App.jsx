import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

const App = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route 
                path="/login" 
                element={user ? <Navigate to="/" /> : <Login />} 
            />
            <Route 
                path="/register" 
                element={user ? <Navigate to="/" /> : <Register />} 
            />
            
            <Route 
                path="/" 
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/customers" 
                element={
                    <ProtectedRoute>
                        <Customers />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/customers/:id" 
                element={
                    <ProtectedRoute>
                        <CustomerDetail />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
};

export default App;
