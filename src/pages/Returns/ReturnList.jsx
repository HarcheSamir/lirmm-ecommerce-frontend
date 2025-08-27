import React, { useEffect, useState, useMemo } from 'react';
import { useReturnStore } from '../../store/returnStore';
import PagesHeader from '../../components/PagesHeader';
import { Link } from 'react-router-dom';
import {
    PiMagnifyingGlass, PiEye, PiCaretUpDown, PiCaretUp, PiCaretDown, PiClock, PiCheckCircle, PiXCircle, PiQuestion
} from "react-icons/pi";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useDebounce } from '../../hooks/useDebounce';

const StatusBadge = ({ status }) => {
    const config = useMemo(() => ({
        PENDING_APPROVAL: { text: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: PiClock },
        AWAITING_CUSTOMER_RESPONSE: { text: 'Awaiting Response', color: 'bg-blue-100 text-blue-800', icon: PiQuestion },
        APPROVED: { text: 'Approved', color: 'bg-indigo-100 text-indigo-800', icon: PiCheckCircle },
        REJECTED: { text: 'Rejected', color: 'bg-red-100 text-red-700', icon: PiXCircle },
        COMPLETED: { text: 'Completed', color: 'bg-green-100 text-green-800', icon: PiCheckCircle },
    }), [])[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: PiClock };
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

export default function ReturnList() {
    const { returnRequests, pagination, isLoading, fetchReturnRequests } = useReturnStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ status: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
    
    const statusOptions = ['PENDING_APPROVAL', 'AWAITING_CUSTOMER_RESPONSE', 'APPROVED', 'REJECTED', 'COMPLETED'];

    useEffect(() => {
        const params = { ...sort };
        if (filters.status) params.status = filters.status;
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        fetchReturnRequests(currentPage, 10, params);
    }, [currentPage, fetchReturnRequests, filters, debouncedSearchTerm, sort]);

    const handleSort = (field) => {
        const isAsc = sort.sortBy === field && sort.sortOrder === 'asc';
        setSort({ sortBy: field, sortOrder: isAsc ? 'desc' : 'asc' });
    };

    const renderSortIcon = (field) => {
        if (sort.sortBy !== field) return <PiCaretUpDown className="text-gray-400" />;
        return sort.sortOrder === 'asc' ? <PiCaretUp className="text-primary" /> : <PiCaretDown className="text-primary" />;
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            <PagesHeader title="Return Requests" breadcrumbs={[{ label: 'Dashboard', link: '/dashboard' }, { label: 'Returns' }]} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:w-auto sm:max-w-xs">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="search" 
                            placeholder="Search by ID or customer..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50/80 rounded-lg focus:ring-primary focus:border-primary" 
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select name="status" value={filters.status} onChange={(e) => { setFilters({ status: e.target.value }); setCurrentPage(1); }} className="p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary">
                             <option value="">All Statuses</option>
                             {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                         </select>
                    </div>
                </div>
                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Request ID</th>
                                <th scope="col" className="px-6 py-3">Order ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Reason</th>
                                <th scope="col" className="px-6 py-3">
                                    <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-800">Date {renderSortIcon('createdAt')}</button>
                                </th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && returnRequests.length === 0 ? (
                                <tr><td colSpan="7" className="text-center p-8 text-gray-500">Loading requests...</td></tr>
                            ) : !isLoading && returnRequests.length === 0 ? (
                                <tr><td colSpan="7" className="text-center p-8 text-gray-500">No return requests found.</td></tr>
                            ) : (
                                returnRequests.map(req => (
                                    <tr key={req.id} className="bg-white border-b border-gray-200/80 hover:bg-gray-50/50 align-middle">
                                        <td className="px-6 py-4 font-medium text-primary hover:underline">
                                            <Link to={`/dashboard/returns/${req.id}`}>#{req.id.substring(0, 8).toUpperCase()}</Link>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700 hover:underline">
                                            <Link to={`/dashboard/orders/${req.orderId}`}>#{req.orderId.substring(0, 8).toUpperCase()}</Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{req.customerName}</div>
                                            <div className="text-gray-500 text-xs">{req.customerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{req.reason}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(req.createdAt)}</td>
                                        <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                        <td className="px-6 py-4">
                                            <Link to={`/dashboard/returns/${req.id}`} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary"><PiEye size={18} /></Link>
                                        </td>
                                    </tr>
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