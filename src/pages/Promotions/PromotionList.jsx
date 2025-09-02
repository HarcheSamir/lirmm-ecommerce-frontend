import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PagesHeader from '../../components/PagesHeader';
import { useProductStore } from '../../store/productStore';
import { PiMagnifyingGlass, PiPencilSimpleLine, PiTrash, PiDotsSixVerticalBold } from "react-icons/pi";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

// --- START: SELF-CONTAINED COMPONENT DEFINITIONS ---
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  const handleToggle = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label
      onClick={(e) => e.stopPropagation()}
      className="relative inline-flex items-center cursor-pointer"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        onClick={handleToggle}
        className="sr-only peer"
        disabled={disabled}
      />
      <div
        className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
          checked ? 'peer-checked:bg-primary' : ''
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      ></div>
    </label>
  );
};

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const handlePageClick = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
        }
    };
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between text-sm text-gray-600">
             <span>
                Affichage de {startItem} à {endItem} sur {totalItems} promotions
            </span>
            <div className="flex items-center gap-2">
                <button onClick={() => handlePageClick(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"> <FaAngleDoubleLeft /> </button>
                <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"> <FaChevronLeft /> </button>
                <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"> <FaChevronRight /> </button>
                <button onClick={() => handlePageClick(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"> <FaAngleDoubleRight /> </button>
            </div>
        </div>
    );
};
// --- END: SELF-CONTAINED COMPONENT DEFINITIONS ---

export default function PromotionList() {
    const navigate = useNavigate();
    const { promotions, isPromotionLoading, fetchPromotions, deletePromotion, updatePromotion, reorderPromotions } = useProductStore();
    
    const [displayPromotions, setDisplayPromotions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7;
    
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    useEffect(() => {
        fetchPromotions(); 
    }, [fetchPromotions]);
    
    useEffect(() => {
        const filtered = searchTerm
            ? promotions.filter(p => 
                p.title?.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.title?.en?.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : promotions;
        setDisplayPromotions(filtered);
    }, [promotions, searchTerm]);

    const paginatedPromotions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return displayPromotions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [displayPromotions, currentPage]);

    const handleToggleActive = async (promotion) => {
        const { id, isActive, ...rest } = promotion;
        const updatedPromotionData = { ...rest, isActive: !isActive };
        await updatePromotion(id, updatedPromotionData);
    };

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
            deletePromotion(id);
        }
    };

    const handleDragEnd = () => {
        const orderedIds = displayPromotions.map(p => p.id);
        reorderPromotions(orderedIds);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleDragSort = () => {
        let _promotions = [...displayPromotions];
        const draggedItemContent = _promotions.splice(dragItem.current, 1)[0];
        _promotions.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = dragOverItem.current;
        setDisplayPromotions(_promotions);
    };

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            <PagesHeader
                title="Promotions"
                breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Promotions', link: '/dashboard/promotions' }]}
                actionButtonText="Créer une Promotion"
                onActionButtonClick={() => navigate('/dashboard/promotions/create')}
            />
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-grow flex flex-col">
                 <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                     <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Rechercher par titre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                        />
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                 </div>
                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-4 py-3 w-12"></th>
                                <th scope="col" className="px-6 py-3">Promotion</th>
                                <th scope="col" className="px-6 py-3">Lien Cible</th>
                                <th scope="col" className="px-6 py-3">Expire le</th>
                                <th scope="col" className="px-6 py-3 text-center">Actif</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isPromotionLoading && paginatedPromotions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-8">Chargement...</td></tr>
                            ) : !isPromotionLoading && paginatedPromotions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-8">Aucune promotion trouvée.</td></tr>
                            ) : (
                                paginatedPromotions.map((promo, index) => (
                                    <tr 
                                        key={promo.id}
                                        onDragEnter={() => (dragOverItem.current = index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDragSort}
                                        className="bg-white border-b border-gray-100 hover:bg-gray-50 align-middle"
                                    >
                                        <td 
                                            draggable={!searchTerm}
                                            onDragStart={() => (dragItem.current = index)}
                                            className={`px-4 py-4 text-gray-400 hover:text-gray-700 ${!searchTerm ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                        >
                                            {!searchTerm && <PiDotsSixVerticalBold size={20} />}
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img src={promo.imageUrl || 'https://via.placeholder.com/64'} alt={promo.title?.fr} className="w-12 h-12 object-cover rounded-md shrink-0"/>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{promo.title?.fr || 'Titre non défini'}</p>
                                                    <p className="text-xs text-gray-500">{promo.subtitle?.fr || ''}</p>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4 text-primary font-medium truncate max-w-xs">
                                            <a href={promo.ctaLink} target="_blank" rel="noopener noreferrer">{promo.ctaLink}</a>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString('fr-FR') : 'Jamais'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <ToggleSwitch
                                                checked={promo.isActive}
                                                onChange={() => handleToggleActive(promo)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4 text-gray-500">
                                                <button onClick={() => navigate(`/dashboard/promotions/edit/${promo.id}`)} className="hover:text-primary"><PiPencilSimpleLine size={18} /></button>
                                                <button onClick={() => handleDelete(promo.id)} className="hover:text-red-600"><PiTrash size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="pt-4 mt-auto">
                    {!searchTerm && <Pagination totalItems={displayPromotions.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={setCurrentPage} />}
                </div>
            </div>
        </div>
    );
}