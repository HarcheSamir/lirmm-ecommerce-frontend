import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReturnStore } from '../../store/returnStore';
import PagesHeader from '../../components/PagesHeader';
import { PiSpinnerGap, PiPaperPlaneRight, PiUserCircle, PiImage, PiChatText } from 'react-icons/pi';

const StatusBadge = ({ status }) => {
    const config = useMemo(() => ({
        PENDING_APPROVAL: { text: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
        AWAITING_CUSTOMER_RESPONSE: { text: 'Awaiting Customer Response', color: 'bg-blue-100 text-blue-800' },
        APPROVED: { text: 'Approved', color: 'bg-indigo-100 text-indigo-800' },
        REJECTED: { text: 'Rejected', color: 'bg-red-100 text-red-700' },
        COMPLETED: { text: 'Completed', color: 'bg-green-100 text-green-800' },
    }), [])[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>{config.text}</span>;
};

const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

export default function ReturnDetail() {
    const { id } = useParams();
    const { returnRequest, isLoading, fetchReturnRequestById, manageReturnRequest, createReturnRequestComment, clearReturnRequest } = useReturnStore();
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (id) fetchReturnRequestById(id);
        return () => clearReturnRequest();
    }, [id, fetchReturnRequestById, clearReturnRequest]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        await createReturnRequestComment(id, newComment);
        setNewComment('');
    };
    
    const handleStatusUpdate = async (newStatus) => {
        await manageReturnRequest(id, newStatus);
    };

    if (isLoading && !returnRequest) {
        return <div className="flex h-full items-center justify-center p-10"><PiSpinnerGap className="animate-spin text-4xl text-primary" /></div>;
    }

    if (!returnRequest) {
        return <div className="p-10 text-center text-gray-600">Return request not found.</div>;
    }

    const { items, comments, imageUrls } = returnRequest;

    return (
        <div className='flex flex-col p-4'>
            <PagesHeader
                title={`Return Request #${id.substring(0, 8).toUpperCase()}`}
                breadcrumbs={[{ label: 'Dashboard', link: '/dashboard' }, { label: 'Returns', link: '/dashboard/returns' }, { label: 'Details' }]}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                {/* --- Main Column --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border p-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Order ID: <Link to={`/dashboard/orders/${returnRequest.orderId}`} className="text-primary hover:underline font-medium">#{returnRequest.orderId.substring(0,8).toUpperCase()}</Link></p>
                            <p className="text-sm text-gray-500 mt-1">Requested on: {formatDate(returnRequest.createdAt)}</p>
                        </div>
                        <StatusBadge status={returnRequest.status} />
                    </div>

                    {/* Items to Return */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Items to Return</h3>
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img src={item.orderItem.imageUrl} alt={item.orderItem.productName} className="w-16 h-16 object-cover rounded-lg" />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{item.orderItem.productName}</p>
                                        <p className="text-sm text-gray-500">Quantity to return: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* User Provided Images */}
                    {imageUrls && imageUrls.length > 0 && (
                        <div className="bg-white rounded-xl border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><PiImage/> Customer Images</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {imageUrls.map((url, index) => (
                                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                                        <img src={url} alt={`Return attachment ${index + 1}`} className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conversation Thread */}
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><PiChatText /> Conversation</h3>
                        <div className="space-y-5">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><PiUserCircle className="text-2xl text-gray-400"/></div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-800">{returnRequest.customerName} <span className="text-xs text-gray-400 font-normal ml-2">{formatDate(returnRequest.createdAt)}</span></p>
                                    <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">{returnRequest.reason}</div>
                                </div>
                            </div>
                            {comments.map(comment => (
                                <div key={comment.id} className={`flex gap-3 ${comment.authorName !== 'Guest' ? 'justify-end' : ''}`}>
                                    {comment.authorName === 'Guest' && <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><PiUserCircle className="text-2xl text-gray-400"/></div>}
                                    <div className={`${comment.authorName !== 'Guest' ? 'text-right' : ''}`}>
                                        <p className="font-semibold text-sm text-gray-800">{comment.authorName} <span className="text-xs text-gray-400 font-normal ml-2">{formatDate(comment.createdAt)}</span></p>
                                        <div className={`mt-1 text-sm text-white bg-primary p-3 rounded-lg border ${comment.authorName !== 'Guest' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600'}`}>{comment.commentText}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleCommentSubmit} className="mt-6 flex items-start gap-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Type your response here..."
                                className="w-full p-3 border border-gray-300 rounded-md bg-white focus:ring-primary focus:border-primary text-sm"
                                rows="3"
                            ></textarea>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 h-full">
                                <PiPaperPlaneRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- Side Column --- */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Request</h3>
                        <div className="space-y-2">
                             <button onClick={() => handleStatusUpdate('APPROVED')} disabled={isLoading} className="w-full text-left p-3 rounded-md hover:bg-indigo-50 font-medium text-indigo-700 disabled:opacity-50">Approve Request</button>
                             <button onClick={() => handleStatusUpdate('REJECTED')} disabled={isLoading} className="w-full text-left p-3 rounded-md hover:bg-red-50 font-medium text-red-700 disabled:opacity-50">Reject Request</button>
                             <button onClick={() => handleStatusUpdate('COMPLETED')} disabled={isLoading} className="w-full text-left p-3 rounded-md hover:bg-green-50 font-medium text-green-700 disabled:opacity-50">Mark as Completed & Refund</button>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h3>
                        <div className="text-sm space-y-1 text-gray-600">
                             <p><strong className="text-gray-700">Name:</strong> {returnRequest.customerName}</p>
                             <p><strong className="text-gray-700">Email:</strong> {returnRequest.customerEmail}</p>
                             <p><strong className="text-gray-700">Phone:</strong> {returnRequest.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}