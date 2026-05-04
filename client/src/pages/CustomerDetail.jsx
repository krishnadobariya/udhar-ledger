import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
    ArrowLeft, Phone, MapPin, Plus, Minus, Loader2, 
    Trash2, Calendar, FileText, IndianRupee, MessageCircle, Download, Image as ImageIcon, X, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTxModal, setShowTxModal] = useState(false);
    const [txType, setTxType] = useState('credit');
    const [txForm, setTxForm] = useState({ amount: '', note: '', date: new Date().toISOString().split('T')[0], attachment: null });
    const [submitting, setSubmitting] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [viewingReceipt, setViewingReceipt] = useState(null);

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    const fetchCustomerDetails = async () => {
        try {
            const { data } = await customerAPI.getById(id);
            setData(data);
        } catch (error) {
            console.error('Error fetching details:', error);
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTxForm({ ...txForm, attachment: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!txForm.amount || parseFloat(txForm.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        setSubmitting(true);
        try {
            await transactionAPI.create({
                customerId: id,
                type: txType,
                amount: parseFloat(txForm.amount),
                note: txForm.note,
                date: txForm.date,
                attachment: txForm.attachment
            });
            setShowTxModal(false);
            setTxForm({ amount: '', note: '', date: new Date().toISOString().split('T')[0], attachment: null });
            fetchCustomerDetails();
        } catch (error) {
            alert('Error adding transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTransaction = async (txId) => {
        if (window.confirm('Delete this transaction?')) {
            try {
                await transactionAPI.delete(txId);
                fetchCustomerDetails();
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    const sendWhatsAppReminder = () => {
        if (!data) return;
        const { customer } = data;
        if (customer.totalCredit <= 0) {
            alert("No pending balance for this customer.");
            return;
        }
        const message = `Hello ${customer.name}, your pending balance at ${user.shopName} is ₹${Math.abs(customer.totalCredit).toLocaleString()}. Please settle it soon. Thank you!`;
        const url = `https://wa.me/91${customer.mobileNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const exportPDF = () => {
        if (!data) return;
        const { customer } = data;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246);
        doc.text(user.shopName || 'Udhaar Ledger', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Customer Statement: ${customer.name}`, 14, 30);
        doc.text(`Mobile: ${customer.mobileNumber}`, 14, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

        const balance = customer.totalCredit;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Final Balance: RS. ${Math.abs(balance).toLocaleString()} (${balance > 0 ? 'DUE' : 'ADVANCE'})`, 14, 50);

        const tableData = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.type.toUpperCase(),
            tx.note || '-',
            tx.type === 'credit' ? `+${tx.amount}` : '-',
            tx.type === 'payment' ? `-${tx.amount}` : '-',
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['Date', 'Type', 'Note', 'Credit (+)', 'Payment (-)']],
            body: tableData,
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save(`${customer.name}_Statement.pdf`);
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;
    if (!data) return null;

    const { customer, transactions } = data;

    const filteredTransactions = transactions.filter(tx => {
        if (!dateRange.start && !dateRange.end) return true;
        const txDate = new Date(tx.date);
        const start = dateRange.start ? new Date(dateRange.start) : new Date('1970-01-01');
        const end = dateRange.end ? new Date(dateRange.end) : new Date('2099-12-31');
        return txDate >= start && txDate <= end;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Customers
                </button>
                <div className="flex gap-2">
                    <button onClick={exportPDF} className="btn btn-outline py-1.5 px-3 flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button onClick={sendWhatsAppReminder} className="btn bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 flex items-center gap-2 text-sm">
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                    </button>
                </div>
            </div>

            <div className="card bg-gradient-to-br from-white to-gray-50 border-none shadow-xl">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                            {customer.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-blue-500" /> {customer.mobileNumber}
                                </span>
                                {customer.address && (
                                    <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-blue-500" /> {customer.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-[200px] flex flex-col justify-center text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Balance</p>
                        <p className={`text-3xl font-black ${customer.totalCredit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{Math.abs(customer.totalCredit || 0).toLocaleString()}
                        </p>
                        <p className={`text-[10px] font-bold uppercase mt-1 ${customer.totalCredit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {customer.totalCredit > 0 ? 'Customer Owes You' : 'You Owe Customer'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={() => { setTxType('credit'); setShowTxModal(true); }} className="btn bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 flex-1 flex items-center justify-center gap-2 py-3">
                        <Plus className="w-5 h-5" /> Give Credit (Udhaar)
                    </button>
                    <button onClick={() => { setTxType('payment'); setShowTxModal(true); }} className="btn bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20 flex-1 flex items-center justify-center gap-2 py-3">
                        <Minus className="w-5 h-5" /> Received Payment
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" /> Transaction History
                    </h2>
                    
                    <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                        <Filter className="w-4 h-4 text-gray-500 ml-1" />
                        <input type="date" className="bg-transparent border-none text-xs focus:ring-0" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                        <span className="text-gray-400">to</span>
                        <input type="date" className="bg-transparent border-none text-xs focus:ring-0" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                        {(dateRange.start || dateRange.end) && (
                            <button onClick={() => setDateRange({start: '', end: ''})} className="p-1 hover:bg-gray-200 rounded text-gray-500">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <div className="card text-center py-12 text-gray-500 bg-gray-50 border-dashed border-2">No transactions found.</div>
                    ) : (
                        filteredTransactions.map((tx) => (
                            <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={tx._id} className="card p-4 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {tx.type === 'credit' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{tx.type === 'credit' ? 'Udhaar (Given)' : 'Payment (Received)'}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(tx.date).toLocaleDateString()}</span>
                                            {tx.note && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {tx.note}</span>}
                                            {tx.attachment && <button onClick={() => setViewingReceipt(tx.attachment)} className="flex items-center gap-1 text-blue-600 hover:underline"><ImageIcon className="w-3 h-3" /> Receipt</button>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                    </p>
                                    <button onClick={() => handleDeleteTransaction(tx._id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {showTxModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTxModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-xl ${txType === 'credit' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{txType === 'credit' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}</div>
                                <h2 className="text-2xl font-bold">{txType === 'credit' ? 'Add Udhaar' : 'Receive Payment'}</h2>
                            </div>
                            <form onSubmit={handleAddTransaction} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input required type="number" step="0.01" className="input pl-10 text-xl font-bold" placeholder="0.00" value={txForm.amount} onChange={(e) => setTxForm({...txForm, amount: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input required type="date" className="input" value={txForm.date} onChange={(e) => setTxForm({...txForm, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                    <input className="input" placeholder="What's this for?" value={txForm.note} onChange={(e) => setTxForm({...txForm, note: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Photo</label>
                                    <label className="btn btn-outline flex cursor-pointer items-center justify-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> {txForm.attachment ? 'Change Receipt' : 'Upload Receipt'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    {txForm.attachment && (
                                        <div className="mt-2 relative w-20 h-20 group">
                                            <img src={txForm.attachment} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                            <button 
                                                type="button" 
                                                onClick={() => setTxForm({...txForm, attachment: null})}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowTxModal(false)} className="btn btn-outline flex-1">Cancel</button>
                                    <button type="submit" disabled={submitting} className={`btn flex-1 flex items-center justify-center gap-2 ${txType === 'credit' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingReceipt && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setViewingReceipt(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setViewingReceipt(null)}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img 
                                src={viewingReceipt} 
                                alt="Receipt" 
                                className="w-full h-full object-contain rounded-lg shadow-2xl"
                            />
                            <div className="mt-4 flex gap-4">
                                <a 
                                    href={viewingReceipt} 
                                    download="receipt.png" 
                                    className="btn bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Receipt
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDetail;
