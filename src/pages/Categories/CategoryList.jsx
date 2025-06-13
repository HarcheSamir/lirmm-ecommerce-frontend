// src/pages/Categories/CategoryList.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PagesHeader from '../../components/PagesHeader';
import { useCategoryStore } from '../../store/categoryStore';
import {
    PiMagnifyingGlass,
    PiPencilSimpleLine,
    PiDotsThreeVertical,
    PiArrowElbowDownRight,
    PiCaretDown,
    PiCaretUp
} from "react-icons/pi";
import {
    FaChevronLeft,
    FaChevronRight,
    FaAngleDoubleLeft,
    FaAngleDoubleRight
} from "react-icons/fa";

// --- Pagination Component (Slightly modified for parent-based pagination) ---
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const handlePageClick = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
        }
    };
    
    // ... (rest of pagination component is the same, no changes needed)
    const renderPageNumbers = () => { /* ... */ };
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between text-sm text-gray-600">
             <span>
                Showing {startItem} to {endItem} of {totalItems} parent categories
            </span>
            <div className="flex items-center gap-2">
                <button onClick={() => handlePageClick(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"> <FaAngleDoubleLeft /> </button>
                <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"> <FaChevronLeft /> </button>
                 {/* ... page numbers rendering ... */}
                <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"> <FaChevronRight /> </button>
                <button onClick={() => handlePageClick(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"> <FaAngleDoubleRight /> </button>
            </div>
        </div>
    );
};


// --- Main CategoryList Component ---
export default function CategoryList() {
    const navigate = useNavigate();
    const { categories, isLoading, fetchCategories } = useCategoryStore();
    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});

    const ITEMS_PER_PAGE = 7;

    useEffect(() => {
        fetchCategories(1, 1000); 
    }, [fetchCategories]);

    // This function toggles the expanded state for a given category ID
    const handleToggleExpand = (categoryId) => {
        setExpandedRows(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Filter and prepare parent categories for display
    const parentCategories = useMemo(() => {
        const allParents = categories.filter(c => c.parentId === null);
        
        if (!searchTerm) return allParents;
        
        // If searching, show a parent if it or any of its children match the search term
        const matchingChildParentIds = new Set(
            categories
                .filter(c => c.parentId !== null && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(c => c.parentId)
        );

        return allParents.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || matchingChildParentIds.has(p.id)
        );
    }, [categories, searchTerm]);

    // Paginate the filtered list of parent categories
    const paginatedParentCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return parentCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [parentCategories, currentPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSelectAll = (e) => {
        // ... (selection logic can be enhanced if needed)
    };
    const handleSelectOne = (e, categoryId) => {
        // ... (selection logic can be enhanced if needed)
    };

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            <PagesHeader
                title="Catégories"
                breadcrumbs={[
                    { label: 'Tableau de bord', link: '/dashboard' },
                    { label: 'Catégories', link: '/dashboard/categories' },
                    { label: 'Liste' }
                ]}
            />
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-grow flex flex-col">
                 {/* Filters Header (no changes) */}
                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                     {/* ... Search and filter inputs ... */}
                 </div>

                {/* Categories Table with Accordion */}
                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase">
                            <tr>
                                <th scope="col" className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} /></th>
                                <th scope="col" className="px-6 py-3">Categories</th>
                                <th scope="col" className="px-6 py-3">Total Products</th>
                                <th scope="col" className="px-6 py-3">Total Earning</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && paginatedParentCategories.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8">Loading...</td></tr>
                            ) : !isLoading && paginatedParentCategories.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8">No categories found.</td></tr>
                            ) : (
                                paginatedParentCategories.map(parent => (
                                    <React.Fragment key={parent.id}>
                                        {/* Parent Category Row */}
                                        <tr className="bg-white border-b border-gray-100 hover:bg-gray-50 align-middle">
                                            <td className="p-4"><input type="checkbox" onChange={(e) => handleSelectOne(e, parent.id)} /></td>
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img src={parent.imageUrl || 'https://via.placeholder.com/64/f0f0f0/999999?text=Img'} alt={parent.name} className="w-12 h-12 object-cover rounded-md shrink-0"/>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{parent.name}</p>
                                                        <p className="text-xs text-gray-500">Choose from wide range...</p>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4 text-gray-500 font-medium">{`${parent.subCategoryCount} categor${parent.subCategoryCount !== 1 ? 'ies' : 'y'}`}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">$7912.99</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4 text-gray-500">
                                                    <button className="hover:text-primary"><PiPencilSimpleLine size={18} /></button>
                                                    <button className="hover:text-primary"><PiDotsThreeVertical size={18} /></button>
                                                    <button onClick={() => handleToggleExpand(parent.id)} className="hover:text-primary">
                                                        {expandedRows[parent.id] ? <PiCaretUp size={18} /> : <PiCaretDown size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Collapsible Row for Children */}
                                        <tr>
                                            <td colSpan="5" className="p-0 bg-gray-50/50">
                                                <div className={`grid transition-all duration-300 ease-in-out ${expandedRows[parent.id] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        {categories.filter(c => c.parentId === parent.id).map(child => (
                                                            <div key={child.id} className="flex items-center border-t border-gray-200/80 px-6 py-3 ml-12">
                                                                <div className="flex items-center gap-3 w-[40%]">
                                                                    <PiArrowElbowDownRight className="text-gray-400 shrink-0" size={18} />
                                                                    <p className="font-semibold text-gray-700">{child.name}</p>
                                                                </div>
                                                                <div className="w-[20%] px-6 text-gray-500">{`${child.productCount} product${child.productCount !== 1 ? 's' : ''}`}</div>
                                                                <div className="w-[20%] px-6 text-gray-800 font-medium">$1234.56</div>
                                                                <div className="w-[20%] px-6 flex items-center gap-4 text-gray-500">
                                                                    <button className="hover:text-primary"><PiPencilSimpleLine size={18} /></button>
                                                                    <button className="hover:text-primary"><PiDotsThreeVertical size={18} /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Table Footer & Pagination */}
                <div className="pt-4 mt-auto">
                    <Pagination totalItems={parentCategories.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
}