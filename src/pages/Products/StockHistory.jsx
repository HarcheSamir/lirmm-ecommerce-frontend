import React, { useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useProductStore } from '../../store/productStore';
import PagesHeader from '../../components/PagesHeader';
import { PiArrowCircleUp, PiArrowCircleDown, PiSpinnerGap, PiArrowLeft, PiPackageDuotone } from 'react-icons/pi';

export default function StockHistory() {
    const { variantId } = useParams();
    const location = useLocation();
    const { variant, product } = location.state || {};
    const { stockHistory, isLoading, fetchStockHistory } = useProductStore();

    useEffect(() => {
        if (variantId) {
            fetchStockHistory(variantId);
        }
    }, [variantId, fetchStockHistory]);

    const movementTypeConfig = useMemo(() => ({
        INITIAL_STOCK: { text: "Initial Stock", icon: PiArrowCircleUp, color: "text-blue-500" },
        ADMIN_UPDATE: { text: "Manual Adjustment", icon: PiArrowCircleUp, color: "text-purple-500" },
        ORDER: { text: "Order Placed", icon: PiArrowCircleDown, color: "text-red-500" },
        ADJUSTMENT: { text: "Correction", icon: PiArrowCircleUp, color: "text-yellow-600" },
        ORDER_CANCELLED: { text: "Order Return", icon: PiArrowCircleUp, color: "text-green-500" },
    }), []);

    const pageTitle = product ? `Stock History for ${product.name}` : "Stock History";
    const breadcrumbs = [
        { label: 'Dashboard', link: '/dashboard' },
        { label: 'Products', link: '/dashboard/products' },
        { label: 'Stock', link: '/dashboard/products/stock' },
        { label: 'History' }
    ];

    if (isLoading && stockHistory.length === 0) {
        return (
            <div className='flex flex-col h-full p-4 gap-4'>
                <PagesHeader title="Loading History..." breadcrumbs={breadcrumbs} />
                <div className="flex items-center justify-center p-20"><PiSpinnerGap className="animate-spin text-4xl text-primary" /></div>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            <PagesHeader title={pageTitle} breadcrumbs={breadcrumbs} />

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 flex justify-between items-center">
                {product && variant ? (
                    <div className="flex items-center gap-4">
                        <img src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/64'} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div>
                            <p className="font-semibold text-lg text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {variant.sku || product.sku}</p>
                            <p className="text-sm text-gray-500">{Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(' / ')}</p>
                        </div>
                    </div>
                ) : (
                    <p className="font-semibold text-lg">Variant Details</p>
                )}
                <Link to="/dashboard/products/stock" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                    <PiArrowLeft />
                    Back to Stock List
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-grow">
                {stockHistory.length === 0 ? (
                    <div className="text-center py-10">
                        <PiPackageDuotone className="mx-auto text-5xl text-gray-300" />
                        <h3 className="mt-2 text-lg font-medium text-gray-800">No History Found</h3>
                        <p className="mt-1 text-sm text-gray-500">There are no recorded stock movements for this variant.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-3">Date & Time</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3 text-center">Change</th>
                                    <th className="px-6 py-3">Reason</th>
                                    <th className="px-6 py-3">Related Order</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stockHistory.map((move) => {
                                    const config = movementTypeConfig[move.type] || { text: move.type, icon: PiArrowCircleUp, color: "text-gray-500" };
                                    const Icon = config.icon;
                                    const isPositive = move.changeQuantity > 0;
                                    return (
                                        <tr key={move.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-600">{new Date(move.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 font-medium ${config.color}`}>
                                                    <Icon size={18} />
                                                    <span>{config.text}</span>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-center font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {isPositive ? `+${move.changeQuantity}` : move.changeQuantity}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 italic">{move.reason || 'N/A'}</td>
                                            <td className="px-6 py-4 text-primary hover:underline">
                                                {move.relatedOrderId ? (
                                                    <Link to={`/dashboard/orders/${move.relatedOrderId}`}>#{move.relatedOrderId.substring(0, 8)}</Link>
                                                ) : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}