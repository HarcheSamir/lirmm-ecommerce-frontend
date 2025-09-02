import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PagesHeader from '../../components/PagesHeader';
import { HashLink } from 'react-router-hash-link';
import JoditEditor from 'jodit-react';
import { useFormWithValidation } from '../../hooks/useFormWithValidation';
import { Controller } from 'react-hook-form';
import {
  PiCloudArrowUpDuotone,
  PiXBold,
  PiStackDuotone,
  PiCheckCircleFill,
  PiPlus,
  PiTrash
} from "react-icons/pi";
import { productSchema } from '../../utils/schemas';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
import { toast } from 'react-toastify';

const options = ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'font', 'fontsize', '|', 'align', '|', 'hr', '|', 'fullsize', 'brush', '|', 'link', '|', 'undo'];

const LanguageTab = ({ lang, activeLang, setActiveLang }) => (
    <button type="button" onClick={() => setActiveLang(lang)} className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors duration-200 ${activeLang === lang ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {lang.toUpperCase()}
    </button>
);


export default function ProductEdit() {
    const navigate = useNavigate();
    const { id: productId } = useParams();
    const { product, isLoading, isUploading, fetchProductById, updateProduct, clearProduct } = useProductStore();
    const { categories, fetchCategories, categoryIsLoading } = useCategoryStore();

    const config = (lang) => useMemo(() => ({
        readonly: false,
        placeholder: `Entrez la description du produit ici... (${lang.toUpperCase()})`,
        defaultActionOnPaste: 'insert_as_html',
        defaultLineHeight: 1.5,
        enter: 'div',
        buttons: options,
        buttonsMD: options,
        buttonsSM: options,
        buttonsXS: options,
        statusbar: false,
        toolbarAdaptive: false,
        addNewLine: false,
    }), [lang]);
    
    const [activeLang, setActiveLang] = useState('fr');
    const [activeSection, setActiveSection] = useState('sec1');

    const navItems = useMemo(() => [
        { label: 'Résumé', id: 'sec1' }, { label: 'Images', id: 'sec2' }, { label: 'Catégories', id: 'sec3' },
        { label: 'Variantes', id: 'sec5' },
    ], []);

    const { register, handleSubmit, formState: { errors }, control, reset, setValue } = useFormWithValidation(productSchema);

    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [variants, setVariants] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProductById(productId);
        fetchCategories(1, 500);
        return () => clearProduct();
    }, [productId, fetchProductById, fetchCategories, clearProduct]);

    useEffect(() => {
        if (product) {
            reset({
                sku: product.sku,
                name: {
                    fr: product.name?.fr || '',
                    en: product.name?.en || '',
                    ar: product.name?.ar || '',
                },
                description: {
                    fr: product.description?.fr || '',
                    en: product.description?.en || '',
                    ar: product.description?.ar || '',
                }
            });
            setSelectedCategoryIds(product.categories.map(c => c.category.id));
            setVariants(product.variants || []);
            setImagePreviews(product.images.map(img => ({ url: img.imageUrl, id: img.id })));
        }
    }, [product, reset]);

    useEffect(() => {
        const observerCallback = entries => entries.forEach(entry => entry.isIntersecting && setActiveSection(entry.target.id));
        const observer = new IntersectionObserver(observerCallback, { root: null, rootMargin: '0px 0px -75% 0px', threshold: 0 });
        const sections = navItems.map(item => document.getElementById(item.id));
        sections.forEach(section => section && observer.observe(section));
        return () => sections.forEach(section => section && observer.unobserve(section));
    }, [navItems]);

    const onSubmit = async (data) => {
        if (selectedCategoryIds.length === 0) { toast.error("Veuillez sélectionner au moins une catégorie."); return; }
        if (imagePreviews.length === 0) { toast.error("Veuillez téléverser au moins une image."); return; }

        const originalImageIds = product.images.map(img => img.id);
        const remainingImageIds = imagePreviews.map(p => p.id).filter(Boolean);
        
        const payload = {
            ...data,
            isActive: product.isActive,
            categoryIds: selectedCategoryIds,
            imageChanges: {
                imagesToRemove: originalImageIds.filter(id => !remainingImageIds.includes(id)),
                newImageFiles: imagePreviews.filter(p => p.file).map(p => p.file),
            }
        };

        const success = await updateProduct(productId, payload);
        if (success) {
            navigate('/dashboard/products');
        }
    };

    const handleImageSelectClick = () => fileInputRef.current?.click();
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        const newPreviews = files.map(file => ({ file, url: URL.createObjectURL(file) }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        event.target.value = null;
    };
    const handleRemoveImage = (urlToRemove) => {
        const previewToRemove = imagePreviews.find(p => p.url === urlToRemove);
        if (previewToRemove?.file) {
            URL.revokeObjectURL(previewToRemove.url);
        }
        setImagePreviews(prev => prev.filter(p => p.url !== urlToRemove));
    };
    useEffect(() => {
      return () => imagePreviews.forEach(p => p.file && URL.revokeObjectURL(p.url));
    }, [imagePreviews]);

    const handleCategoryToggle = (category) => {
        setSelectedCategoryIds(prev => prev.includes(category.id) ? prev.filter(id => id !== category.id) : [...prev, category.id]);
    };
    const handleRemoveCategoryTag = (categoryId) => setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));

    if (isLoading && !product) {
        return <div className="flex items-center justify-center h-full">Loading Product...</div>;
    }
    if (!product) {
        return <div className="flex items-center justify-center h-full">Product not found.</div>;
    }
    const isProcessing = isLoading || isUploading;

    return (
    <div className="flex flex-col ">
      <PagesHeader className={'px-4'} title="Modifier le Produit" breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Produits', link: '/dashboard/products' }, { label: 'Modifier' }]}/>
      <nav className="mb-8 scrollbar-thumb-transparent scrollbar-track-transparent mx-4 pt-2 text-sm sticky top-0 bg-white z-10 border-b border-gray-300 flex gap-4 md:gap-8 overflow-x-auto">
        {navItems.map(item => (<div key={item.id} className='flex flex-col items-center flex-shrink-0'><HashLink smooth to={`#${item.id}`} className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold whitespace-nowrap ${activeSection === item.id ? 'text-fblack' : 'text-gray-500 hover:text-fblack'}`}> {item.label} </HashLink><div className={`h-[2px] w-full mt-1 transition-colors duration-200 ${activeSection === item.id ? 'bg-fblack' : 'bg-transparent'}`} /></div>))}
      </nav>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col px-4 '>
        <section id="sec1" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'>
            <p className='font-medium text-fblack text-[16px]'>Résumé</p> <p className='text-sm font mt-1 text-gray-500'>Modifiez le titre, le SKU et la description.</p>
          </div>
          <div className='w-full flex flex-col gap-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className="md:col-span-2">
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU (Base)*</label>
                <input type="text" id="sku" {...register("sku")} className={`w-full px-3 rounded-[3px] py-2 border ${errors.sku ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} placeholder="SKU unique" />
                {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
              </div>
            </div>
            <div className="border border-gray-200 rounded-md">
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                    {['fr', 'en', 'ar'].map(lang => <LanguageTab key={lang} lang={lang} activeLang={activeLang} setActiveLang={setActiveLang} />)}
                </div>
                <div className="p-4">
                    {['fr', 'en', 'ar'].map(lang => (
                        <div key={lang} style={{ display: activeLang === lang ? 'block' : 'none' }}>
                            <div className='mb-4'>
                                <label htmlFor={`name.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Nom Produit ({lang.toUpperCase()})*</label>
                                <input type="text" id={`name.${lang}`} {...register(`name.${lang}`)} className={`w-full px-3 rounded-[3px] py-2 border ${errors.name?.[lang] ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} placeholder={`Nom du produit en ${lang}`} />
                                {errors.name?.[lang] && <p className="mt-1 text-xs text-red-600">{errors.name[lang].message}</p>}
                            </div>
                            <div tabIndex={0}>
                                <label htmlFor={`description.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Description ({lang.toUpperCase()})</label>
                                <Controller name={`description.${lang}`} control={control} render={({ field }) => ( <JoditEditor value={field.value || ''} config={config(lang)} onBlur={newContent => field.onChange(newContent)} /> )} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>
        <div className='my-12'><div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /></div>
        <section id="sec2" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'>
            <p className='font-medium text-fblack text-[16px]'>Images*</p> <p className='text-sm font mt-1 text-gray-500'>Gérez la galerie d'images.</p>
          </div>
          <div className='w-full flex flex-col gap-4'>
            <div className='border-gray-300 border cursor-pointer gap-4 w-full rounded-md py-8 flex flex-col justify-center items-center hover:border-blue-500 transition-colors' onClick={handleImageSelectClick} role="button" tabIndex={0}>
              <PiCloudArrowUpDuotone className='text-4xl text-gray-500' /> <p className='text-sm font-semibold text-fblack'>Ajouter des images</p> <p className='text-xs text-gray-500'>Formats: JPG, PNG, GIF, WEBP</p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
            {imagePreviews.length > 0 && (
              <div className="mt-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {imagePreviews.map((preview) => (
                  <div key={preview.url} className="relative group border border-gray-200 rounded overflow-hidden">
                    <img src={preview.url} alt="Aperçu" className="h-24 w-full object-cover" />
                    <button type="button" onClick={() => handleRemoveImage(preview.url)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="Supprimer l'image"> <PiXBold size={12} /> </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <div className='my-12'><div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /></div>
        <section id="sec3" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'>
            <p className='font-medium text-fblack text-[16px]'>Catégories*</p> <p className='text-sm font mt-1 text-gray-500'>Sélectionnez les catégories.</p>
          </div>
          <div className='w-full flex flex-col gap-4'>
             <div tabIndex={0} className='border border-gray-200 rounded-md overflow-y-auto max-h-[250px]'>
               {categoryIsLoading ? (<p className="p-4 text-center text-gray-500">Chargement...</p>) : categories.map((category) => {
                       const isSelected = selectedCategoryIds.includes(category.id);
                       return (<div key={category.id} onClick={() => handleCategoryToggle(category)} className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}><PiStackDuotone className='text-gray-400 text-2xl shrink-0' /><div className='flex-grow'> <p className='font-semibold text-sm text-gray-800'>{category.name}</p> {category.description && <p className='text-xs text-gray-500 line-clamp-1'>{category.description.replace(/<[^>]*>/g, '')}</p>} </div><div className='shrink-0 ml-auto'> {isSelected ? (<PiCheckCircleFill className='text-blue-500 text-xl' />) : (<div className='w-5 h-5 border border-gray-300 rounded'></div>)} </div></div>); })}
           </div>
           {selectedCategoryIds.length > 0 && (<div className='flex flex-wrap items-center gap-2 mt-1'><PiStackDuotone className='text-gray-400 text-lg shrink-0' />{selectedCategoryIds.map((id) => { const cat = categories.find(c => c.id === id); if (!cat) return null; return (<div key={cat.id} className='flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700'><span>{cat.name}</span><button type="button" onClick={() => handleRemoveCategoryTag(cat.id)} className='ml-1 text-gray-500 hover:text-red-600' aria-label={`Remove ${cat.name}`}><PiXBold size={12} /></button></div>); })}</div>)}
          </div>
        </section>
        <div className='my-12'><div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /></div>
        <section id="sec5" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
           <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'>
            <p className='font-medium text-fblack text-[16px]'>Variantes</p> <p className='text-sm font mt-1 text-gray-500'>Les variantes existantes sont affichées. La modification des variantes sera bientôt disponible.</p>
           </div>
           <div className='w-full flex flex-col gap-6'>
             {variants.length > 0 ? (
                <div className="mt-6 flow-root"><div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"><div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead><tr className="bg-gray-50">
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-3">SKU</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Attributs</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Stock</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Prix</th>
                        </tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map((variant) => (<tr key={variant.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{variant.sku || product.sku}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Object.entries(variant.attributes).map(([key, val]) => `${key}: ${val}`).join(', ')}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{variant.stockQuantity || '0'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{variant.price ? `$${parseFloat(variant.price).toFixed(2)}` : '-'}</td>
                            </tr>))}
                        </tbody>
                    </table>
                </div></div></div>
             ) : (
                <p className='text-gray-500 italic'>Ce produit n'a pas de variantes.</p>
             )}
          </div>
        </section>
        <div className="flex bg-white mt-12 sticky bottom-0 py-4 border-gray-300 border-t z-10 -mx-4 px-4">
          <button type="submit" disabled={isProcessing} className={`px-6 text-sm cursor-pointer ml-auto py-3 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUploading ? 'Téléversement...' : isLoading ? 'Mise à jour...' : 'Mettre à jour le Produit'}
          </button>
        </div>
      </form>
    </div>
  );
}