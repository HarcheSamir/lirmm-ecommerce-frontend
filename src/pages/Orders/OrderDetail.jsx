// src/pages/Orders/OrderDetail.jsx
import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import PagesHeader from '../../components/PagesHeader';
import {
    PiClock, PiTruck, PiCheckCircle, PiXCircle, PiCreditCard, PiUserCircle, PiMapPin, PiSpinnerGap
} from 'react-icons/pi';

// --- Helper Functions and Components ---
const formatCurrency = (amount, fallback = '$0.00') => amount ? `$${parseFloat(amount).toFixed(2)}` : fallback;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const StatusBadge = ({ status }) => {
    const config = useMemo(() => ({
        PENDING: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
        PAID: { text: 'Paid', color: 'bg-green-100 text-green-800' },
        SHIPPED: { text: 'Shipped', color: 'bg-blue-100 text-blue-800' },
        DELIVERED: { text: 'Delivered', color: 'bg-purple-100 text-purple-800' },
        CANCELLED: { text: 'Cancelled', color: 'bg-red-100 text-red-800' },
        FAILED: { text: 'Failed', color: 'bg-red-200 text-red-800' },
    }), [])[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>{config.text}</span>;
};

const StatusTimeline = ({ currentStatus, onStatusChange, isLoading }) => {
    const statuses = ['PENDING', 'SHIPPED', 'DELIVERED'];
    const allPossibleStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
    const currentIndex = statuses.indexOf(currentStatus);

    const icons = { PENDING: PiClock, SHIPPED: PiTruck, DELIVERED: PiCheckCircle, CANCELLED: PiXCircle, FAILED: PiXCircle };
    const isCancelledOrFailed = ['CANCELLED', 'FAILED'].includes(currentStatus);

    return (
        <div className="bg-white rounded-xl border border-gray-200/80 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Status</h3>
            <div className="space-y-2">
                {statuses.map((status, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const isDone = index < currentIndex;
                    const Icon = icons[status];
                    return (
                        <div key={status} className="flex items-start">
                            <div className="flex flex-col items-center mr-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive && !isCancelledOrFailed ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Icon size={20} />
                                </div>
                                {index < statuses.length - 1 && (
                                    <div className={`w-0.5 h-8 mt-2 ${isActive && !isCancelledOrFailed ? 'bg-primary' : 'bg-gray-200'}`} />
                                )}
                            </div>
                            <div className="pt-2">
                                <p className={`font-semibold ${isActive && !isCancelledOrFailed ? 'text-gray-800' : 'text-gray-500'}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</p>
                                {isCurrent && !isCancelledOrFailed && <p className="text-xs text-gray-500">Current status</p>}
                                {isDone && !isCancelledOrFailed && <p className="text-xs text-gray-500">Completed</p>}
                            </div>
                        </div>
                    );
                })}
                {isCancelledOrFailed && (
                     <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500 text-white">
                                <PiXCircle size={20} />
                            </div>
                        </div>
                        <div className="pt-2">
                            <p className="font-semibold text-red-600">{currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6">
                <label htmlFor="status-update" className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <select
                    id="status-update"
                    value={currentStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-primary focus:border-primary disabled:bg-gray-100"
                >
                    {allPossibleStatuses.map(s => (
                        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};


export default function OrderDetail() {
    const { id } = useParams();
    const { order, isLoading, fetchOrderById, updateOrderStatus, clearOrder } = useOrderStore();

    useEffect(() => {
        if (id) fetchOrderById(id);
        return () => clearOrder();
    }, [id, fetchOrderById, clearOrder]);

    // ** THE FIX: Calculate cost and revenue from authoritative backend data **
    const { totalCost, totalRevenue, subtotal } = useMemo(() => {
        if (!order) return { totalCost: 0, totalRevenue: 0, subtotal: 0 };
        
        const calculatedSubtotal = order.items.reduce((acc, item) => acc + (parseFloat(item.priceAtTimeOfOrder) * item.quantity), 0);
        const calculatedTotalCost = order.items.reduce((acc, item) => acc + (parseFloat(item.costPriceAtTimeOfOrder || 0) * item.quantity), 0);
        const calculatedTotalRevenue = parseFloat(order.totalAmount) - calculatedTotalCost;

        return { totalCost: calculatedTotalCost, totalRevenue: calculatedTotalRevenue, subtotal: calculatedSubtotal };
    }, [order]);

    if (isLoading && !order) {
        return <div className="flex h-full items-center justify-center p-10"><PiSpinnerGap className="animate-spin text-4xl text-primary" /></div>;
    }

    if (!order) {
        return <div className="p-10 text-center text-gray-600">Order not found. It might have been deleted or the ID is incorrect.</div>;
    }
    
    // ** THE FIX: Remove hardcoded client-side calculations **
    // const shippingCost = 0; // No longer needed
    // const tax = 0; // No longer needed
    // const total = order.totalAmount; // Authoritative total from backend

    return (
        <div className='flex flex-col p-4'>
            <PagesHeader
                title={`Order #${order.id.substring(0, 8).toUpperCase()}`}
                breadcrumbs={[{ label: 'Dashboard', link: '/dashboard' }, { label: 'Orders', link: '/dashboard/orders' }, { label: 'Details' }]}
            />
            <div className="flex flex-col lg:flex-row gap-6 mt-4">
                {/* --- Left Column --- */}
                <div className="flex-grow space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{order.items.length} items</span>
                            <span className="text-sm text-gray-500">Total {formatCurrency(order.totalAmount)}</span>
                            <StatusBadge status={order.status} />
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="bg-white rounded-xl border border-gray-200/80">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500">
                                <tr className="border-b border-gray-200">
                                    <th className="p-4 font-medium">Product</th>
                                    <th className="p-4 font-medium">Price</th>
                                    <th className="p-4 font-medium">Quantity</th>
                                    <th className="p-4 font-medium text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={item.imageUrl || `https://via.placeholder.com/64`} alt={item.productName} className="w-12 h-12 object-cover rounded-md" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{item.productName}</p>
                                                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                                    {/* ** THE FIX: Display variant attributes ** */}
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {Object.entries(item.variantAttributes).map(([key, value]) => (
                                                            <span key={key} className="mr-2 capitalize"><strong>{key}:</strong> {value}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">{formatCurrency(item.priceAtTimeOfOrder)}</td>
                                        <td className="p-4 text-gray-600">{item.quantity}</td>
                                        <td className="p-4 text-gray-800 font-medium text-right">{formatCurrency(parseFloat(item.priceAtTimeOfOrder) * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 flex justify-end">
                            <div className="w-full max-w-xs space-y-2 text-sm">
                                {/* ** THE FIX: Use calculated subtotal and authoritative total ** */}
                                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Shipping & Taxes</span><span>{formatCurrency(parseFloat(order.totalAmount) - subtotal)}</span></div>
                                <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t mt-2"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction & Balance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction</h3>
                            <div className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <PiCreditCard className="text-3xl text-yellow-500" />
                                    <div>
                                        <p className="font-semibold text-gray-700">Payment</p>
                                        <p className="text-xs text-gray-500">Via {order.paymentMethod.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                <span className="font-medium text-gray-800">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Balance</h3>
                             <div className="space-y-2 text-sm">
                                {/* ** THE FIX: Use real backend data for calculations ** */}
                                <div className="flex justify-between text-gray-600"><span>Total Sale</span><span>{formatCurrency(order.totalAmount)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Total Cost</span><span className="text-red-600">-{formatCurrency(totalCost)}</span></div>
                                <div className="flex justify-between font-semibold text-gray-800 pt-2 border-t mt-2"><span>Net Revenue</span><span className="text-green-600 font-bold">{formatCurrency(totalRevenue)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column --- */}
                <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-6">
                    <StatusTimeline currentStatus={order.status} onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)} isLoading={isLoading} />

                    <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer</h3>
                        <div className="flex items-center gap-4">
                            {order.customerAvatar ? (
                                <img src={order.customerAvatar} alt={order.customerName} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <PiUserCircle className="text-3xl text-gray-400" />
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-800">{order.customerName || order.guestName}</p>
                                <p className="text-sm text-gray-500">{order.userId ? order.customerEmail : order.guestEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200/80 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><PiMapPin/> Shipping Address</h3>
                        <address className="text-sm text-gray-600 space-y-1 not-italic">
                            <p className="font-medium">{order.shippingAddress?.fullName || order.customerName || order.guestName}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                            <p>{order.shippingAddress?.country}</p>
                        </address>
                    </div>
                </div>
            </div>
        </div>
    );
}