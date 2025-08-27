// src/pages/Orders/OrderList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useOrderStore } from '../../store/orderStore';
import PagesHeader from '../../components/PagesHeader';
import { Link } from 'react-router-dom';
import {
    PiMagnifyingGlass, PiEye, PiDotsThreeVertical, PiCaretDown, PiCaretRight, PiCheckCircle, PiXCircle, PiClock, PiSpinner, PiTruck,
    PiCaretUpDown, PiCaretUp
} from "react-icons/pi";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useDebounce } from '../../hooks/useDebounce';

// --- Helper Components ---
const StatusBadge = ({ status }) => {
    const statusConfig = useMemo(() => ({
        PENDING: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: PiClock },
        PAID: { text: 'Paid', color: 'bg-blue-100 text-blue-800', icon: PiCheckCircle },
        SHIPPED: { text: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: PiTruck },
        DELIVERED: { text: 'Completed', color: 'bg-green-100 text-green-800', icon: PiCheckCircle },
        CANCELLED: { text: 'Cancelled', color: 'bg-red-100 text-red-700', icon: PiXCircle },
        FAILED: { text: 'Failed', color: 'bg-red-200 text-red-800', icon: PiXCircle },
    }), []);
    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: PiSpinner };
    const Icon = config.icon;
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}><Icon className="w-3.5 h-3.5" />{config.text}</span>;
};

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages, total, limit } = pagination;
    const handlePageClick = (newPage) => { if (newPage >= 1 && newPage <= totalPages) onPageChange(newPage); };
    return (
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries</span>
            <div className="flex items-center gap-1">
                <button onClick={() => handlePageClick(1)} disabled={page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><FaAngleDoubleLeft size={12} /></button>
                <button onClick={() => handlePageClick(page - 1)} disabled={page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><FaChevronLeft size={12} /></button>
                <span className="p-2">Page {page} of {totalPages}</span>
                <button onClick={() => handlePageClick(page + 1)} disabled={page === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><FaChevronRight size={12} /></button>
                <button onClick={() => handlePageClick(totalPages)} disabled={page === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><FaAngleDoubleRight size={12} /></button>
            </div>
        </div>
    );
};

// --- Main OrderList Component ---
export default function OrderList() {
    const { orders, pagination, isLoading, fetchOrders } = useOrderStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState(null);

    const [filters, setFilters] = useState({ status: '', paymentMethod: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
    
    const statusOptions = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'];
    const paymentMethodOptions = ['CREDIT_CARD', 'CASH_ON_DELIVERY'];

    useEffect(() => {
        const params = { ...sort };
        if (filters.status) params.status = filters.status;
        if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;

        fetchOrders(currentPage, 7, params);
    }, [currentPage, fetchOrders, filters, debouncedSearchTerm, sort]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };
    
    const handleSort = (field) => {
        const isAsc = sort.sortBy === field && sort.sortOrder === 'asc';
        setSort({ sortBy: field, sortOrder: isAsc ? 'desc' : 'asc' });
    };

    const renderSortIcon = (field) => {
        if (sort.sortBy !== field) return <PiCaretUpDown className="text-gray-400" />;
        return sort.sortOrder === 'asc' ? <PiCaretUp className="text-primary" /> : <PiCaretDown className="text-primary" />;
    };

    const handleToggleExpand = (orderId) => setExpandedRowId(prevId => (prevId === orderId ? null : orderId));
    const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            <PagesHeader title="Orders" breadcrumbs={[{ label: 'Admin', link: '/dashboard' }, { label: 'Orders', link: '/dashboard/orders' }, { label: 'List' }]} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:w-auto sm:max-w-xs">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="search" 
                            placeholder="Search ID, name, email, phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50/80 rounded-lg focus:ring-primary focus:border-primary" 
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary">
                             <option value="">All Statuses</option>
                             {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                         </select>
                        <select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary">
                             <option value="">All Payment Methods</option>
                             {paymentMethodOptions.map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                         </select>
                    </div>
                </div>
                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th scope="col" className="p-4 w-12"></th>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Items</th>
                                <th scope="col" className="px-6 py-3">
                                    <button onClick={() => handleSort('totalAmount')} className="flex items-center gap-1 hover:text-gray-800">Price {renderSortIcon('totalAmount')}</button>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-800">Created {renderSortIcon('createdAt')}</button>
                                </th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && orders.length === 0 ? (
                                <tr><td colSpan="8" className="text-center p-8 text-gray-500">Loading orders...</td></tr>
                            ) : !isLoading && orders.length === 0 ? (
                                <tr><td colSpan="8" className="text-center p-8 text-gray-500">No orders found for the current filters.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <React.Fragment key={order.id}>
                                        <tr className="bg-white border-b border-gray-200/80 hover:bg-gray-50/50 align-middle">
                                            <td className="p-4"><button onClick={() => handleToggleExpand(order.id)} className="p-2 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors">{expandedRowId === order.id ? <PiCaretDown /> : <PiCaretRight />}</button></td>
                                            <td className="px-6 py-4 font-medium text-primary hover:underline">
                                                <Link to={`/dashboard/orders/${order.id}`}>
                                                  #{order.id.substring(0, 8).toUpperCase()}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{order.customerName}</div>
                                                <div className="text-gray-500 text-xs">{order.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{formatCurrency(order.totalAmount)}</td>
                                            <td className="px-6 py-4 text-gray-600">{formatDate(order.createdAt)}</td>
                                            <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Link to={`/dashboard/orders/${order.id}`} className="p-1 rounded-full hover:bg-gray-100 hover:text-primary"><PiEye size={18} /></Link>
                                                    <button className="p-1 rounded-full hover:bg-gray-100 hover:text-primary"><PiDotsThreeVertical size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className='bg-white'><td colSpan="8" className="p-0">
                                            <div className={`grid transition-all duration-300 ease-in-out ${expandedRowId === order.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                <div className="overflow-hidden bg-gray-50 p-4 border-t-2 border-primary/20">
                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                                                        <div className="lg:col-span-2 space-y-3">
                                                            <h4 className='font-semibold text-gray-700 mb-2'>Order Items ({order.items.length})</h4>
                                                            {order.items.map(item => (
                                                                <div key={item.id} className="flex items-start gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                                                    <img src={item.imageUrl || `https://via.placeholder.com/64/EBF4FF/172554?text=${item.productName.charAt(0)}`} alt={item.productName} className="w-16 h-16 object-cover rounded-md" />
                                                                    <div className="flex-grow">
                                                                        <p className="font-semibold text-gray-800">{item.productName}</p>
                                                                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                                                        <div className="text-xs text-gray-500 mt-1">
                                                                            {Object.entries(item.variantAttributes).map(([key, value]) => (
                                                                                <span key={key} className="mr-2"><strong>{key}:</strong> {value}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0">
                                                                        <p className="font-semibold text-gray-800">{formatCurrency(item.priceAtTimeOfOrder * item.quantity)}</p>
                                                                        <p className="text-xs text-gray-500">{item.quantity} x {formatCurrency(item.priceAtTimeOfOrder)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="space-y-6">
                                                            <div>
                                                                <h4 className='font-semibold text-gray-700 mb-2'>Shipping Details</h4>
                                                                <div className="text-sm bg-white p-4 rounded-lg border border-gray-200 space-y-1 text-gray-600">
                                                                    <p><strong>{order.customerName}</strong></p>
                                                                    <p>{order.shippingAddress?.street || 'N/A'}</p>
                                                                    <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || ''} {order.shippingAddress?.postalCode || ''}</p>
                                                                    <p>{order.shippingAddress?.country || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className='font-semibold text-gray-700 mb-2'>Order Summary</h4>
                                                                <div className="text-sm bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                                                                    <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">{formatCurrency(order.totalAmount)}</span></div>
                                                                    <div className="flex justify-between"><span>Shipping:</span><span className="font-medium">Free</span></div>
                                                                    <div className="flex justify-between pt-2 border-t font-bold text-base text-gray-800"><span>Total:</span><span>{formatCurrency(order.totalAmount)}</span></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td></tr>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination pagination={pagination} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
}