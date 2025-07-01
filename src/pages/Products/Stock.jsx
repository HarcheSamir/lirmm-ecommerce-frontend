import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useProductStore } from '../../store/productStore';
import PagesHeader from '../../components/PagesHeader';
import { PiMagnifyingGlass, PiPencilSimpleLine, PiX, PiFloppyDisk, PiSpinnerGap, PiListNumbers, PiPackageDuotone, PiPlus, PiMinus } from 'react-icons/pi';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";


const AdjustStockModal = ({ variant, product, onClose }) => {
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: { changeQuantity: '', reason: '' }
    });
    const { adjustStock, isLoading } = useProductStore();
    const quickReasons = ["Stock Count Correction", "Internal Use", "Damaged Goods", "Promotional Giveaway",  "Return from Customer"];

    const changeQuantityValue = watch('changeQuantity');
    const newStockLevel = useMemo(() => {
        const current = variant.stockQuantity || 0;
        const change = parseInt(changeQuantityValue, 10);
        return isNaN(change) ? current : current + change;
    }, [changeQuantityValue, variant.stockQuantity]);

    const handleIncrement = (amount) => {
        const current = parseInt(changeQuantityValue, 10) || 0;
        setValue('changeQuantity', current + amount, { shouldValidate: true });
    };

    const onSubmit = async (data) => {
        const payload = {
            changeQuantity: parseInt(data.changeQuantity, 10),
            type: 'ADMIN_UPDATE',
            reason: data.reason
        };
        const success = await adjustStock(variant.id, payload);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] transform animate-slide-up">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Adjust Stock</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"><PiX size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                            <img src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/64'} alt={product.name} className="w-16 h-16 object-cover rounded-md shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">SKU: {variant.sku || product.sku}</p>
                                <p className="text-xs text-gray-500">{Object.entries(variant.attributes).map(([k, v]) => v.name || v).join(' / ')}</p>
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <label className="text-sm font-medium text-gray-700 block">Quantity to Adjust</label>
                            <div className="flex items-center justify-center gap-4">
                                <button type="button" onClick={() => handleIncrement(-1)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><PiMinus/></button>
                                <Controller
                                    name="changeQuantity"
                                    control={control}
                                    rules={{
                                        required: "Adjustment value is required.",
                                        validate: value => (value !== 0 && !isNaN(value)) || "Adjustment cannot be zero."
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            className={`w-24 h-14 text-center text-3xl font-bold border-2 rounded-lg transition-colors ${errors.changeQuantity ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary'}`}
                                            placeholder="0"
                                        />
                                    )}
                                />
                                <button type="button" onClick={() => handleIncrement(1)} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><PiPlus/></button>
                            </div>
                             {errors.changeQuantity && <p className="text-xs text-red-600 mt-1">{errors.changeQuantity.message}</p>}
                        </div>

                        <div className="flex items-center justify-around bg-gray-100 p-3 rounded-lg text-center">
                            <div>
                                <p className="text-xs text-gray-500">Current Stock</p>
                                <p className="font-bold text-lg">{variant.stockQuantity}</p>
                            </div>
                            <PiPlus className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Adjustment</p>
                                <p className={`font-bold text-lg ${parseInt(changeQuantityValue, 10) > 0 ? 'text-green-600' : parseInt(changeQuantityValue, 10) < 0 ? 'text-red-600' : ''}`}>
                                    {parseInt(changeQuantityValue, 10) || 0}
                                </p>
                            </div>
                             <p className="font-bold text-xl text-gray-400">=</p>
                            <div>
                                <p className="text-xs text-gray-500">New Stock Level</p>
                                <p className="font-bold text-lg text-primary">{newStockLevel}</p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">Reason for Adjustment*</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {quickReasons.map(reason => (
                                    <button type="button" key={reason} onClick={() => setValue('reason', reason, { shouldValidate: true })} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 hover:text-gray-800">
                                        {reason}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                id="reason"
                                {...control.register("reason", { required: "A reason is required." })}
                                rows="2"
                                className={`w-full p-2 border rounded-md transition-colors ${errors.reason ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary'}`}
                                placeholder="e.g., Stock count correction, Damaged goods..."
                            ></textarea>
                            {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
                        </div>

                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 sticky bottom-0">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                            {isLoading ? <PiSpinnerGap className="animate-spin" size={20}/> : <PiFloppyDisk size={20}/>}
                            {isLoading ? "Saving..." : "Save Adjustment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AttributeDisplay = ({ attributes }) => {
    if (!attributes || Object.keys(attributes).length === 0) {
        return <span className="text-gray-400 italic text-xs">No attributes</span>;
    }

    const colorHex = attributes.colorHex;
    const colorName = attributes.colorNom;

    const otherAttributes = Object.entries(attributes).filter(
        ([key]) => key !== 'colorHex' && key !== 'colorNom'
    );

    return (
        <div className="flex flex-col items-start gap-1">
            {colorHex && (
                <div className="flex items-center gap-2" title={`Color: ${colorName || colorHex}`}>
                    <div
                        className="w-4 h-4 rounded-full border border-gray-400/50 shadow-sm"
                        style={{ backgroundColor: colorHex }}
                    />
                    <span className="text-sm text-gray-700">{colorName || colorHex}</span>
                </div>
            )}
            {otherAttributes.map(([key, value]) => (
                <div key={key} className="text-sm text-gray-700">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium text-gray-800 ml-1">{value}</span>
                </div>
            ))}
        </div>
    );
};


const StockArc = ({ stockQuantity, lowStockThreshold }) => {
    const [animatedQuantity, setAnimatedQuantity] = useState(0);

    const size = 80;
    const strokeWidth = 8;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const startAngle = -135;
    const endAngle = 135;

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [ "M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y ].join(" ");
        return d;
    };

    const lowStock = lowStockThreshold || 10;
    const maxStock = lowStock * 10;
    const progress = stockQuantity > 0 ? Math.min(stockQuantity / maxStock, 1) : 0;
    const progressAngle = startAngle + (progress * (endAngle - startAngle));

    let colorClass, textClass;
    if (progress <= 0.3) { colorClass = 'stroke-red-500'; textClass = 'text-red-600'; }
    else if (progress <= 0.6) { colorClass = 'stroke-yellow-500'; textClass = 'text-yellow-500'; }
    else { colorClass = 'stroke-green-500'; textClass = 'text-green-600'; }
    if (stockQuantity <= 0) { colorClass = 'stroke-red-500'; textClass = 'text-red-600'; }

    useEffect(() => {
        let numberAnimationFrameId;
        let startTimestamp = null;
        const duration = 800;
        const countUpStep = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progressRatio = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progressRatio * stockQuantity);
            setAnimatedQuantity(currentValue);
            if (elapsed < duration) { numberAnimationFrameId = requestAnimationFrame(countUpStep); }
            else { setAnimatedQuantity(stockQuantity); }
        };
        numberAnimationFrameId = requestAnimationFrame(countUpStep);
        return () => { cancelAnimationFrame(numberAnimationFrameId); };
    }, [stockQuantity]);

    const [animatedPath, setAnimatedPath] = useState(describeArc(center, center, radius, startAngle, startAngle));
    useEffect(() => {
        let pathAnimationFrameId;
        let startTimestamp = null;
        const duration = 800;
        const animateArcStep = (timestamp) => {
            if(!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progressRatio = Math.min(elapsed / duration, 1);
            const currentAngle = startAngle + (progressRatio * (progressAngle - startAngle));
            setAnimatedPath(describeArc(center, center, radius, startAngle, currentAngle));
            if(elapsed < duration) { pathAnimationFrameId = requestAnimationFrame(animateArcStep); }
        };
        pathAnimationFrameId = requestAnimationFrame(animateArcStep);
        return () => cancelAnimationFrame(pathAnimationFrameId);
    }, [progressAngle]);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <path d={describeArc(center, center, radius, startAngle, endAngle)} fill="none" strokeWidth={strokeWidth} className="stroke-gray-200" strokeLinecap="round" />
                <path d={animatedPath} fill="none" strokeWidth={strokeWidth} className={`${colorClass}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${textClass}`}>{animatedQuantity}</span>
            </div>
        </div>
    );
};


const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages, total, limit } = pagination;
    const handlePageClick = (newPage) => { if (newPage >= 1 && newPage <= totalPages) onPageChange(newPage); };
    return (
        <div className="flex items-center justify-between text-sm text-gray-600">
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

export default function Stock() {
    const { products, pagination, isLoading, fetchProducts } = useProductStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [modalVariant, setModalVariant] = useState(null);
    const [modalProduct, setModalProduct] = useState(null);

    useEffect(() => {
        fetchProducts(currentPage, 10, { name: searchTerm });
    }, [currentPage, searchTerm, fetchProducts]);

    const handleOpenModal = (variant, product) => {
        setModalVariant(variant);
        setModalProduct(product);
    };

    const handleCloseModal = () => {
        setModalVariant(null);
        setModalProduct(null);
    };

    const allVariants = useMemo(() => {
        return products.flatMap(product =>
            product.variants.map(variant => ({ ...variant, product }))
        );
    }, [products]);

    const filteredVariants = useMemo(() => {
        return allVariants.filter(variant => {
            const product = variant.product;
            const searchTermLower = searchTerm.toLowerCase();
            const nameMatch = product.name.toLowerCase().includes(searchTermLower);
            const skuMatch = (variant.sku || product.sku).toLowerCase().includes(searchTermLower);

            let stockMatch = true;
            if (stockFilter === 'low') {
                stockMatch = variant.stockQuantity > 0 && variant.stockQuantity <= (variant.lowStockThreshold || 10);
            } else if (stockFilter === 'out') {
                stockMatch = variant.stockQuantity <= 0;
            }

            return (nameMatch || skuMatch) && stockMatch;
        });
    }, [allVariants, searchTerm, stockFilter]);

    const getStockStatusText = (variant) => {
        if (variant.stockQuantity <= 0) return { text: "Out of Stock", color: "text-red-600 bg-red-100" };
        if (variant.stockQuantity <= (variant.lowStockThreshold || 10)) return { text: "Low Stock", color: "text-yellow-600 bg-yellow-100" };
        return { text: "In Stock", color: "text-green-600 bg-green-100" };
    };

    return (
        <div className='flex flex-col h-full p-4 gap-4'>
            {modalVariant && <AdjustStockModal variant={modalVariant} product={modalProduct} onClose={handleCloseModal} />}
            <PagesHeader
                title="Stock Management"
                breadcrumbs={[{ label: 'Dashboard', link: '/dashboard' }, { label: 'Products', link: '/dashboard/products' }, { label: 'Stock' }]}
            />
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex-grow flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="relative w-full sm:w-auto sm:max-w-xs">
                        <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="p-2 border border-gray-200 bg-gray-50 rounded-lg text-sm"
                        >
                            <option value="all">All Stock Statuses</option>
                            <option value="low">Low Stock</option>
                            <option value="out">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Product</th>
                                <th scope="col" className="px-6 py-3">SKU</th>
                                <th scope="col" className="px-6 py-3">Attributes</th>
                                <th scope="col" className="px-6 py-3 text-center">Stock Level</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && filteredVariants.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-8"><PiSpinnerGap className="animate-spin text-2xl text-primary mx-auto" /></td></tr>
                            ) : !isLoading && filteredVariants.length === 0 ? (
                                <tr><td colSpan="6" className="text-center p-8">No variants found matching your criteria.</td></tr>
                            ) : (
                                filteredVariants.map(variant => {
                                    const product = variant.product;
                                    const status = getStockStatusText(variant);
                                    return (
                                        <tr key={variant.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 align-middle">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/64'} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                                    <div>
                                                        <p className="font-semibold w-64 truncate text-gray-800">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.categories?.[0]?.category?.name || 'Uncategorized'}</p>
                                                    </div>
                                                </div>
                                            </th>
                                            <td className="px-6 py-4 text-gray-500">{variant.sku || product.sku}</td>
                                            <td className="px-6 py-4">
                                                <AttributeDisplay attributes={variant.attributes} />
                                            </td>
                                            <td className="px-6 py-4 flex justify-center">
                                                <StockArc
                                                    key={variant.id}
                                                    stockQuantity={variant.stockQuantity}
                                                    lowStockThreshold={variant.lowStockThreshold || 10}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>{status.text}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <button onClick={() => handleOpenModal(variant, product)} className="p-1.5 rounded-md hover:bg-gray-200 hover:text-primary" title="Adjust Stock"><PiPencilSimpleLine size={16} /></button>
                                                    <Link to={`/dashboard/products/stock/history/${variant.id}`} state={{ variant, product }} className="p-1.5 rounded-md hover:bg-gray-200 hover:text-primary" title="View History"><PiListNumbers size={16} /></Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
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