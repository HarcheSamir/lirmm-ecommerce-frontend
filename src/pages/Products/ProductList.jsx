// src/pages/Products/ProductList.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PagesHeader from '../../components/PagesHeader';
import { useProductStore } from '../../store/productStore';
import {
    PiMagnifyingGlass,
    PiPencilSimpleLine,
    PiDotsThreeVertical,
    PiTrash,
    PiStarFill
} from "react-icons/pi";
import {
    FaChevronLeft,
    FaChevronRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight
} from "react-icons/fa";

// --- Helper Components ---

// Star Rating Component
const StarRating = ({ rating = 0, reviewCount = 0 }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const emptyStars = totalStars - fullStars;

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{rating.toFixed(1)}</span>
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => <PiStarFill key={`full-${i}`} className="text-yellow-400" />)}
                {[...Array(emptyStars)].map((_, i) => <PiStarFill key={`empty-${i}`} className="text-gray-300" />)}
            </div>
            <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>
    );
};

// Stock Status Component
const StockStatus = ({ product }) => {
    const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stockQuantity || 0), 0);
    const lowStockThreshold = 20;
    let barColor, textColor, text, widthPercentage;
    if (totalStock > lowStockThreshold) {
        barColor = 'bg-green-500'; textColor = 'text-gray-600'; text = `${totalStock} in stock`; widthPercentage = Math.min((totalStock / 100) * 100, 100);
    } else if (totalStock > 0) {
        barColor = 'bg-yellow-500'; textColor = 'text-gray-600'; text = `${totalStock} low stock`; widthPercentage = Math.min((totalStock / lowStockThreshold) * 100, 100);
    } else {
        barColor = 'bg-gray-300'; textColor = 'text-gray-500'; text = 'Out of Stock'; widthPercentage = 100;
    }
    return (
        <div>
            <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${widthPercentage}%` }}></div></div>
            <p className={`text-xs mt-1 ${textColor}`}>{text}</p>
        </div>
    );
};

// Pagination Component
const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages } = pagination;
    const handlePageClick = (newPage) => { if (newPage >= 1 && newPage <= totalPages) { onPageChange(newPage); } };
    const renderPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) { pageNumbers.push(i); } }
        else {
            if (page > 2) pageNumbers.push(1); if (page > 3) pageNumbers.push('...');
            for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) { if (!pageNumbers.includes(i)) pageNumbers.push(i); }
            if (page < totalPages - 2) pageNumbers.push('...'); if (page < totalPages - 1) pageNumbers.push(totalPages);
        }
        return pageNumbers.map((p, index) =>
            p === '...' ? (<span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm text-gray-500">...</span>)
                : (<button key={p} onClick={() => handlePageClick(p)} className={`px-3 py-1.5 text-sm font-medium rounded-md ${page === p ? 'bg-primary text-white' : 'text-gray-600 bg-white hover:bg-gray-100'}`}>{p}</button>)
        );
    };
    return (
        <div className="flex w-full flex-wrap justify-between items-center text-sm text-gray-600">
            <span>Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
            <div className="flex items-center gap-2">
                <button onClick={() => handlePageClick(1)} disabled={page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FaAngleDoubleLeft /></button>
                <button onClick={() => handlePageClick(page - 1)} disabled={page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FaChevronLeft /></button>
                <div className="flex items-center gap-1">{renderPageNumbers()}</div>
                <button onClick={() => handlePageClick(page + 1)} disabled={page === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FaChevronRight /></button>
                <button onClick={() => handlePageClick(totalPages)} disabled={page === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FaAngleDoubleRight /></button>
            </div>
        </div>
    );
};

// Actions Dropdown Component
const ActionsMenu = ({ productId, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="hover:text-primary p-1 rounded-full hover:bg-gray-100">
                <PiDotsThreeVertical size={18} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                        <button
                            onClick={() => {
                                onDelete(productId);
                                setIsOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <PiTrash size={16} />
                            Supprimer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main ProductList Component ---
export default function ProductList() {
    const navigate = useNavigate();
    const { products, pagination, isLoading, fetchProducts, deleteProduct } = useProductStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProducts(currentPage, 7);
    }, [currentPage, fetchProducts]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedProducts(products.map(p => p.id));
        else setSelectedProducts([]);
    };
    const handleSelectOne = (e, productId) => {
        if (e.target.checked) setSelectedProducts(prev => [...prev, productId]);
        else setSelectedProducts(prev => prev.filter(id => id !== productId));
    };
    const isAllSelected = products.length > 0 && selectedProducts.length === products.length;

    const handleDeleteProduct = (productId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
            deleteProduct(productId);
        }
    };

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            <PagesHeader
                title="Produits"
                breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Produits', link: '/dashboard/products' }, { label: 'Liste' }]}
            />
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:w-auto sm:max-w-xs">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="search" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" /></th>
                                <th scope="col" className="px-6 py-3">Product</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3">Rating</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && products.length === 0 ? (<tr><td colSpan="7" className="text-center p-8">Loading products...</td></tr>)
                                : !isLoading && products.length === 0 ? (<tr><td colSpan="7" className="text-center p-8">No products found.</td></tr>)
                                    : (products.map(product => (
                                        <tr key={product.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 align-middle">
                                            <td className="w-4 p-4"><input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={(e) => handleSelectOne(e, product.id)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" /></td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/64'} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                                    <div>
                                                        <p className="font-semibold w-[90%] truncate text-gray-800">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.categories?.[0]?.category?.name || 'Uncategorized'}</p>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 text-[12px] py-4 text-gray-500">{product.sku}</td>
                                            <td className="px-6 py-4"><StockStatus product={product} /></td>
                                            <td className="px-6 py-4 font-medium text-gray-800">${parseFloat(product.variants?.[0]?.price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4"><StarRating rating={3.8} reviewCount={19} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Link to={`/dashboard/products/edit/${product.id}`} className="hover:text-primary p-1 rounded-full hover:bg-gray-100"><PiPencilSimpleLine size={18} /></Link>
                                                    <ActionsMenu productId={product.id} onDelete={handleDeleteProduct} />
                                                </div>
                                            </td>
                                        </tr>
                                    )))}
                        </tbody>
                    </table>
                </div>
                <div className="pt-4 mt-auto">
                    <Pagination pagination={pagination} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
}