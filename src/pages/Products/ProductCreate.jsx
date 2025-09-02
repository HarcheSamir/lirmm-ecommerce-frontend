import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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


export default function ProductCreate() {
    const navigate = useNavigate();
    const createProduct = useProductStore((state) => state.createProduct);
    const isLoading = useProductStore((state) => state.isLoading);
    const isUploading = useProductStore((state) => state.isUploading);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);
    const categories = useCategoryStore((state) => state.categories);
    const categoryIsLoading = useCategoryStore((state) => state.isLoading);

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

    const sectionOneRef = useRef(null);
    const sectionTwoRef = useRef(null);
    const sectionThreeRef = useRef(null);
    const sectionFourRef = useRef(null);
    const sectionFiveRef = useRef(null);
    const sectionSixRef = useRef(null);
    const sectionSevenRef = useRef(null);

    const navItems = useMemo(() => [
        { label: 'Résumé', id: 'sec1' }, { label: 'Images', id: 'sec2' }, { label: 'Catégories', id: 'sec3' },
        { label: 'Attributs', id: 'sec4' }, { label: 'Variantes', id: 'sec5' }, { label: 'SEO', id: 'sec6' }, { label: 'Autre', id: 'sec7' },
    ], []);

    const { register, handleSubmit, formState: { errors }, control, reset } = useFormWithValidation(productSchema);

    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const fileInputRef = useRef(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [productAttributes, setProductAttributes] = useState(['Color']);
    const [newAttributeName, setNewAttributeName] = useState('');
    const [variants, setVariants] = useState([]);
    const [currentVariant, setCurrentVariant] = useState({ sku: '', prix: '', prixCoutant: '', stockQuantity: '', lowStockThreshold: '', attributs: { colorNom: '', colorHex: '#ffffff' } });

    useEffect(() => { fetchCategories(1, 500); }, [fetchCategories]);

    useEffect(() => {
        const observerOptions = { root: null, rootMargin: '0px 0px -75% 0px', threshold: 0 };
        const observerCallback = (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const sections = navItems.map(item => document.getElementById(item.id));
        sections.forEach((section) => { if (section) observer.observe(section); });
        return () => { sections.forEach((section) => { if (section) observer.unobserve(section); }); };
    }, [navItems]);

    const onSubmit = async (data) => {
        if (variants.length === 0) { toast.error("Veuillez ajouter au moins une variante de produit."); sectionFiveRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
        if (selectedCategoryIds.length === 0) { toast.error("Veuillez sélectionner au moins une catégorie."); sectionThreeRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }
        if (selectedImages.length === 0) { toast.error("Veuillez téléverser au moins une image."); sectionTwoRef.current?.scrollIntoView({ behavior: 'smooth' }); return; }

        const formattedVariants = variants.map(v => {
            const apiAttributes = { ...v.attributs };
            if (apiAttributes.colornom !== undefined) { apiAttributes['Color'] = apiAttributes.colornom || 'N/A'; delete apiAttributes.colornom; delete apiAttributes.colorhex; }
            Object.keys(apiAttributes).forEach(key => { if (apiAttributes[key] === '' || apiAttributes[key] === undefined || apiAttributes[key] === null) { delete apiAttributes[key]; } });
            return { sku: v.sku || undefined, attributes: apiAttributes, price: parseFloat(v.prix), costPrice: v.prixCoutant ? parseFloat(v.prixCoutant) : undefined, initialStockQuantity: v.stockQuantity ? parseInt(v.stockQuantity, 10) : 0, lowStockThreshold: v.lowStockThreshold ? parseInt(v.lowStockThreshold, 10) : undefined, };
        });

        const productPayload = { ...data, isActive: true, categoryIds: selectedCategoryIds, imageFiles: selectedImages, variants: formattedVariants, };
        const result = await createProduct(productPayload);
        if (result) {
            reset();
            setSelectedImages([]); setImagePreviews([]); setSelectedCategoryIds([]); setVariants([]);
            setCurrentVariant({ sku: '', prix: '', prixCoutant: '', stockQuantity: '', lowStockThreshold: '', attributs: { colorNom: '', colorHex: '#ffffff' } });
            setProductAttributes(['Color']);
            navigate('/dashboard/products');
        }
    };

    const handleImageSelectClick = () => { fileInputRef.current?.click(); };
    const handleFileChange = (event) => {
        const files = event.target.files; if (!files) return;
        const newFilesArray = Array.from(files);
        const currentFiles = [...selectedImages];
        const filesToAdd = newFilesArray.filter(newFile => !currentFiles.some(existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size));
        if (filesToAdd.length > 0) {
            setSelectedImages(prev => [...prev, ...filesToAdd]);
            const newPreviews = filesToAdd.map(file => ({ file: file, url: URL.createObjectURL(file) }));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
        event.target.value = null;
    };
    const handleRemoveImage = (previewUrlToRemove, fileToRemove) => {
        setSelectedImages(prev => prev.filter(file => file !== fileToRemove));
        setImagePreviews(prev => prev.filter(preview => preview.url !== previewUrlToRemove));
        URL.revokeObjectURL(previewUrlToRemove);
    };
    useEffect(() => { return () => { imagePreviews.forEach(preview => URL.revokeObjectURL(preview.url)); }; }, [imagePreviews]);

    const handleCategoryToggle = (category) => { setSelectedCategoryIds((prev) => prev.includes(category.id) ? prev.filter(id => id !== category.id) : [...prev, category.id]); };
    const handleRemoveCategoryTag = (categoryIdToRemove) => { setSelectedCategoryIds((prev) => prev.filter(id => id !== categoryIdToRemove)); };

    const normalizeAttributeName = (name) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');

    const handleAddAttribute = (e) => {
        if (e.key === 'Enter' && newAttributeName.trim()) {
            e.preventDefault();
            const trimmedName = newAttributeName.trim();
            const normalizedNew = normalizeAttributeName(trimmedName);
            if (!productAttributes.some(attr => normalizeAttributeName(attr) === normalizedNew)) {
                setProductAttributes(prev => [...prev, trimmedName]);
                setCurrentVariant(prev => ({ ...prev, attributs: { ...prev.attributs, [normalizedNew]: '' } }));
                setNewAttributeName('');
            } else { toast.warn(`L'attribut '${trimmedName}' existe déjà.`); }
        }
    };
    const handleRemoveAttribute = (attributeToRemove) => {
        if (attributeToRemove === 'Color') return;
        const normalizedKey = normalizeAttributeName(attributeToRemove);
        setProductAttributes(prev => prev.filter(attr => attr !== attributeToRemove));
        setCurrentVariant(prev => { const na = { ...prev.attributs }; delete na[normalizedKey]; return { ...prev, attributs: na }; });
        setVariants(prevVs => prevVs.map(v => { const na = { ...v.attributs }; delete na[normalizedKey]; return { ...v, attributs: na }; }));
    };

    const handleCurrentVariantChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('attr-')) { const attrKey = name.split('-')[1]; setCurrentVariant(prev => ({ ...prev, attributs: { ...prev.attributs, [attrKey]: value } })); }
        else { setCurrentVariant(prev => ({ ...prev, [name]: value })); }
    };

    const handleAddVariant = () => {
        let isValid = true;
        if (!currentVariant.prix || isNaN(parseFloat(currentVariant.prix)) || parseFloat(currentVariant.prix) <= 0) { toast.error("Veuillez entrer un prix valide pour la variante."); isValid = false; }
        productAttributes.forEach(attr => {
            const normalizedKey = normalizeAttributeName(attr);
            if (attr === 'Color') { if (!currentVariant.attributs.colornom?.trim()) { toast.error(`Veuillez entrer un Nom de Couleur pour la variante.`); isValid = false; } }
            else { if (!currentVariant.attributs[normalizedKey]?.trim()) { toast.error(`Veuillez entrer une valeur pour l'attribut '${attr}'.`); isValid = false; } }
        });
        if (!isValid) return;

        const newVariantWithId = { ...currentVariant, tempId: Date.now() + Math.random() };
        setVariants(prev => [...prev, newVariantWithId]);
        const resetAttrs = productAttributes.reduce((acc, attr) => {
            const key = normalizeAttributeName(attr);
            if (key === 'colornom') acc[key] = ''; else if (key === 'colorhex') acc[key] = '#ffffff'; else acc[key] = ''; return acc;
        }, {});
        if (!resetAttrs.hasOwnProperty('colornom')) resetAttrs.colornom = '';
        if (!resetAttrs.hasOwnProperty('colorhex')) resetAttrs.colorhex = '#ffffff';
        setCurrentVariant({ sku: '', prix: '', prixCoutant: '', stockQuantity: '', lowStockThreshold: '', attributs: resetAttrs, });
    };

    const handleRemoveVariant = (tempIdToRemove) => { setVariants(prev => prev.filter(v => v.tempId !== tempIdToRemove)); };
    const isProcessing = isLoading || isUploading;

    return (
        <div className="flex flex-col ">
            <PagesHeader className={'px-4'} title="Créer Un Produit" breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Produits', link: '/dashboard/products' }, { label: 'Créer' }]} />
            <nav className="mb-8 scrollbar-thumb-transparent scrollbar-track-transparent mx-4 pt-2 text-sm sticky top-0 bg-white z-10 border-b border-gray-300 flex gap-4 md:gap-8 overflow-x-auto">
                {navItems.map((item) => (<div key={item.id} className='flex flex-col items-center flex-shrink-0'><HashLink smooth to={`#${item.id}`} className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold whitespace-nowrap ${activeSection === item.id ? 'text-fblack' : 'text-gray-500 hover:text-fblack'}`} > {item.label} </HashLink><div className={`h-[2px] w-full mt-1 transition-colors duration-200 ${activeSection === item.id ? 'bg-fblack' : 'bg-transparent'}`} /></div>))}
            </nav>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col  px-4 '>
                <section id="sec1" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
                    <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Résumé</p> <p className='text-sm font mt-1 text-gray-500'>Modifiez le titre, le SKU et la description.</p></div>
                    <div className='w-full flex flex-col gap-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='md:col-span-2'>
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
                <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
                <section id="sec2" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
                    <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Images*</p> <p className='text-sm font mt-1 text-gray-500'>Téléversez la galerie d'images.</p></div>
                    <div className='w-full flex flex-col gap-4'><div className='border-gray-300 border cursor-pointer gap-4 w-full rounded-md py-8 flex flex-col justify-center items-center hover:border-blue-500 transition-colors' onClick={handleImageSelectClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleImageSelectClick()}><PiCloudArrowUpDuotone className='text-4xl text-gray-500' /> <p className='text-sm font-semibold text-fblack'>Glissez-déposez ou cliquez</p> <p className='text-xs text-gray-500'>Formats: JPG, PNG, GIF, WEBP</p></div><input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />{imagePreviews.length > 0 && (<div className="mt-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">{imagePreviews.map((preview) => (<div key={preview.url} className="relative group border border-gray-200 rounded overflow-hidden"><img src={preview.url} alt="Aperçu" className="h-24 w-full object-cover" /><button type="button" onClick={() => handleRemoveImage(preview.url, preview.file)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="Supprimer l'image"> <PiXBold size={12} /> </button></div>))}</div>)}</div>
                </section>
                <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
                <section id="sec3" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '><div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Catégories*</p> <p className='text-sm font mt-1 text-gray-500'>Sélectionnez les catégories.</p></div><div className='w-full flex flex-col gap-4'><div tabIndex={0} className='border border-gray-200 rounded-md overflow-y-auto max-h-[250px]'>{categoryIsLoading ? (<p className="p-4 text-center text-gray-500">Chargement...</p>) : categories.length === 0 ? (<p className="p-4 text-center text-gray-500">Aucune catégorie. <button type="button" onClick={() => navigate('/dashboard/categories/create')} className="text-blue-600 hover:underline">Créer</button></p>) : (categories.map((category) => { const isSelected = selectedCategoryIds.includes(category.id); return (<div key={category.id} onClick={() => handleCategoryToggle(category)} className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`} ><PiStackDuotone className='text-gray-400 text-2xl shrink-0' /><div className='flex-grow'> <p className='font-semibold text-sm text-gray-800'>{category.name}</p> {category.description && <p className='text-xs text-gray-500 line-clamp-1'>{category.description.replace(/<[^>]*>/g, '')}</p>} </div><div className='shrink-0 ml-auto'> {isSelected ? (<PiCheckCircleFill className='text-blue-500 text-xl' />) : (<div className='w-5 h-5 border border-gray-300 rounded'></div>)} </div></div>); }))}</div>{selectedCategoryIds.length > 0 && (<div className='flex flex-wrap items-center gap-2 mt-1'><PiStackDuotone className='text-gray-400 text-lg shrink-0' />{selectedCategoryIds.map((id) => { const category = categories.find(c => c.id === id); if (!category) return null; return (<div key={category.id} className='flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700'> <span>{category.name}</span> <button type="button" onClick={() => handleRemoveCategoryTag(category.id)} className='ml-1 text-gray-500 hover:text-red-600' aria-label={`Remove ${category.name}`}> <PiXBold size={12} /> </button> </div>); })}</div>)}</div></section>
                <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
                <section id="sec4" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '><div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Attributs</p> <p className='text-sm font mt-1 text-gray-500'>Gérez les attributs (ex: Taille). 'Color' est spécial.</p></div><div className='w-full flex flex-col gap-4'><div><label htmlFor="attributVariante" className="block text-sm font-medium text-gray-700 mb-1">Ajouter attribut</label><input type="text" id="attributVariante" value={newAttributeName} onChange={(e) => setNewAttributeName(e.target.value)} onKeyDown={handleAddAttribute} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ajouter et Entrée (ex: Taille)" /></div><div className='flex flex-wrap items-center gap-2 mt-1'>{productAttributes.map((attr) => (<div key={attr} className='flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-700'> <span>{attr}</span> {attr !== 'Color' && (<button type="button" onClick={() => handleRemoveAttribute(attr)} className='ml-1 text-gray-400 hover:text-red-600' aria-label={`Supprimer ${attr}`}> <PiXBold size={12} /> </button>)} </div>))}</div></div></section>
                <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
                <section id="sec5" className='flex flex-col lg:flex-row gap-4 lg:gap-8 '><div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Variantes*</p> <p className='text-sm font mt-1 text-gray-500'>Gérez détails, prix et stock.</p></div><div className='w-full flex flex-col gap-6'><div className="p-4 border border-gray-200 rounded-md"><p className="text-md font-semibold mb-4 text-gray-800">Ajouter une nouvelle variante</p><div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'><div> <label htmlFor="variantSku" className="block text-xs font-medium text-gray-600 mb-1">SKU Variante (Opt)</label> <input type="text" id="variantSku" name="sku" value={currentVariant.sku} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Hérite si vide" /> </div><div></div><div> <label htmlFor="variantPrix" className="block text-xs font-medium text-gray-600 mb-1">Prix*</label> <input type="number" id="variantPrix" name="prix" step="0.01" value={currentVariant.prix} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Prix de vente" /> </div><div> <label htmlFor="variantPrixCoutant" className="block text-xs font-medium text-gray-600 mb-1">Prix Coûtant (Opt)</label> <input type="number" id="variantPrixCoutant" name="prixCoutant" step="0.01" value={currentVariant.prixCoutant} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Coût d'achat" /> </div><div> <label htmlFor="variantStockQuantity" className="block text-xs font-medium text-gray-600 mb-1">Stock Initial</label> <input type="number" id="variantStockQuantity" name="stockQuantity" step="1" min="0" value={currentVariant.stockQuantity} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Quantité initiale" /> </div><div> <label htmlFor="variantLowStockThreshold" className="block text-xs font-medium text-gray-600 mb-1">Seuil Stock Bas (Opt)</label> <input type="number" id="variantLowStockThreshold" name="lowStockThreshold" step="1" min="0" value={currentVariant.lowStockThreshold} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="ex: 10" /> </div></div><div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>{productAttributes.map(attr => { const normalizedKey = normalizeAttributeName(attr); if (attr === 'Color') { return (<React.Fragment key="color-fields"><div> <label htmlFor="attr-colornom" className="block text-xs font-medium text-gray-600 mb-1">Nom Couleur*</label> <input type="text" id="attr-colornom" name="attr-colornom" value={currentVariant.attributs.colornom || ''} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="ex: Rouge Vif" /> </div><div className="flex items-end gap-2"><div className="flex-grow"> <label htmlFor="attr-colorhex" className="block text-xs font-medium text-gray-600 mb-1">Hex Couleur</label> <input type="text" id="attr-colorhex" name="attr-colorhex" value={currentVariant.attributs.colorhex || '#ffffff'} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="#FF0000" /> </div><input type="color" value={currentVariant.attributs.colorhex || '#ffffff'} onChange={(e) => handleCurrentVariantChange({ target: { name: 'attr-colorhex', value: e.target.value } })} className="h-9 w-9 p-0 border border-gray-300 rounded-[3px] cursor-pointer shrink-0" title="Choisir couleur" /></div></React.Fragment>); } else { return (<div key={attr}> <label htmlFor={`attr-${normalizedKey}`} className="block text-xs font-medium text-gray-600 mb-1">{attr}*</label> <input type="text" id={`attr-${normalizedKey}`} name={`attr-${normalizedKey}`} value={currentVariant.attributs[normalizedKey] || ''} onChange={handleCurrentVariantChange} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder={`Valeur ${attr}`} /> </div>); } })}</div><div className="flex justify-end mt-4"> <button type="button" onClick={handleAddVariant} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"> <PiPlus className="-ml-1 mr-2 h-5 w-5 text-gray-500" /> Ajouter Variante </button> </div></div>{variants.length > 0 && (<div className="mt-6 flow-root"><p className="text-md font-semibold mb-4 text-gray-800">Variantes ajoutées</p><div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"> <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"><table className="min-w-full divide-y divide-gray-300"><thead> <tr className="bg-gray-50"><th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 sm:pl-3">SKU</th>{productAttributes.map(attr => (<th key={attr} scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">{attr === 'Color' ? 'Couleur' : attr}</th>))}
<th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Stock Init.</th><th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900">Prix</th><th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3"><span className="sr-only">Del</span></th></tr> </thead><tbody className="bg-white divide-y divide-gray-200">{variants.map((variant) => (<tr key={variant.tempId}><td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">{variant.sku || '-'}</td>{productAttributes.map(attr => { const normalizedKey = normalizeAttributeName(attr); const isColor = attr === 'Color'; const cellValue = isColor ? variant.attributs.colornom : variant.attributs[normalizedKey]; const colorHex = variant.attributs.colorhex; return (<td key={`${variant.tempId}-${attr}`} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"> {isColor ? (<span className="flex items-center gap-2"> <span className="inline-block h-3 w-3 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: colorHex || '#ffffff' }}></span> {cellValue || '-'} </span>) : (cellValue || '-')} </td>); })}<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{variant.stockQuantity || '0'}</td><td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{variant.prix ? `$${parseFloat(variant.prix).toFixed(2)}` : '-'}</td><td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3"> <button type="button" onClick={() => handleRemoveVariant(variant.tempId)} className="text-gray-400 hover:text-red-600" aria-label="Supprimer"> <PiTrash /> </button> </td></tr>))}</tbody></table></div> </div></div>)}</div></section>
                <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
                <section id="sec6" className='min-h-[200px] flex flex-col lg:flex-row gap-4 lg:gap-8 '><div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'> <p className='font-medium text-fblack text-[16px]'>SEO</p> <p className='text-sm font mt-1 text-gray-500'>Gérez les paramètres SEO.</p> </div><div className='w-full text-gray-500 italic'>Section SEO (Contenu à venir)</div></section>
                <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
                <section id="sec7" className='min-h-[200px] flex flex-col lg:flex-row gap-4 lg:gap-8 '><div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'> <p className='font-medium text-fblack text-[16px]'>Visibilité & Statut</p> <p className='text-sm font mt-1 text-gray-500'>Contrôlez la visibilité.</p> </div><div className='w-full text-gray-500 italic'>Section Visibilité (Contenu à venir)</div></section>
                <div className="flex bg-white mt-12 sticky bottom-0 py-4 border-gray-300 border-t z-10 -mx-4 px-4"><button type="submit" disabled={isProcessing} className={`px-6 text-sm cursor-pointer ml-auto py-3 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`} > {isUploading ? 'Téléversement...' : isLoading ? 'Création...' : 'Créer Produit'} </button></div>
            </form>
        </div>
    );
}