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
  PiCircle,
} from "react-icons/pi";
import { categorySchema } from '../../utils/schemas';
import { useCategoryStore } from '../../store/categoryStore';
import { toast } from 'react-toastify';

const options = ['bold', 'italic', 'underline', '|', 'ul', 'ol', '|', 'font', 'fontsize', '|', 'align', '|', 'hr', '|', 'fullsize', 'brush', '|', 'link', '|', 'undo'];

const LanguageTab = ({ lang, activeLang, setActiveLang }) => (
    <button type="button" onClick={() => setActiveLang(lang)} className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors duration-200 ${activeLang === lang ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {lang.toUpperCase()}
    </button>
);

export default function CategoryCreate() {
  const navigate = useNavigate();
  const { createCategory, fetchCategories, categories, parentCategories, isLoading } = useCategoryStore();
  
  const config = (lang) => useMemo(() => ({
    readonly: false,
    placeholder: `Entrez la description de la catégorie ici... (${lang.toUpperCase()})`,
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
  const navItems = useMemo(() => [
    { label: 'Résumé', id: 'sec1' }, { label: 'Miniature', id: 'sec2' }, { label: 'Catégorie Parente', id: 'sec3' },
  ], []);

  const { register, handleSubmit, formState: { errors }, control, reset } = useFormWithValidation(categorySchema);

  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const fileInputRef = useRef(null);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState(null);

  useEffect(() => { fetchCategories(1, 100); }, [fetchCategories]);

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px 0px -75% 0px', threshold: 0 };
    const observerCallback = (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = navItems.map(item => document.getElementById(item.id));
    sections.forEach((section) => { if (section) observer.observe(section); });
    return () => { sections.forEach((section) => { if (section) observer.unobserve(section); }); };
  }, [navItems]);

  const onSubmit = async (data) => {
    const categoryData = { ...data, parentId: selectedParentCategoryId };
    const result = await createCategory(categoryData, thumbnailImage);
    if (result) {
      reset();
      setThumbnailImage(null);
      setThumbnailPreview('');
      setSelectedParentCategoryId(null);
      navigate('/dashboard/categories');
    }
  };

  const handleImageSelectClick = () => { fileInputRef.current?.click(); };
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailImage(file);
      setThumbnailPreview(URL.createObjectURL(file));
      event.target.value = null;
    }
  };
  const handleRemoveImage = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailImage(null);
    setThumbnailPreview('');
  };
  useEffect(() => { return () => { if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview); }; }, [thumbnailPreview]);
  const handleParentCategorySelect = (categoryId) => { setSelectedParentCategoryId(prevId => (prevId === categoryId ? null : categoryId)); };

  return (
    <div className="flex flex-col ">
      <PagesHeader className={'px-4'} title="Créer Une Catégorie" breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Catégories', link: '/dashboard/categories' }, { label: 'Créer' }]} />
      <nav className="mb-8 scrollbar-thumb-transparent scrollbar-track-transparent mx-4 pt-2 text-sm sticky top-0 bg-white z-10 border-b border-gray-300 flex gap-4 md:gap-8 overflow-x-auto">
        {navItems.map((item) => (<div key={item.id} className='flex flex-col items-center flex-shrink-0'><HashLink smooth to={`#${item.id}`} className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold whitespace-nowrap ${activeSection === item.id ? 'text-fblack' : 'text-gray-500 hover:text-fblack'}`}>{item.label}</HashLink><div className={`h-[2px] w-full mt-1 transition-colors duration-200 ${activeSection === item.id ? 'bg-fblack' : 'bg-transparent'}`} /></div>))}
      </nav>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col px-4 '>
        <section id="sec1" ref={sectionOneRef} className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Résumé</p><p className='text-sm font mt-1 text-gray-500'>Définissez le nom, le slug et la description de la catégorie.</p></div>
          <div className='w-full flex flex-col gap-6'>
            <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" id="slug" {...register("slug")} className={`w-full px-3 rounded-[3px] py-2 border ${errors.slug ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} placeholder="category-slug (laissé vide pour auto)"/>
                {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
            </div>
            <div className="border border-gray-200 rounded-md">
                <div className="flex border-b border-gray-200 bg-gray-50/50">
                    {['fr', 'en', 'ar'].map(lang => <LanguageTab key={lang} lang={lang} activeLang={activeLang} setActiveLang={setActiveLang} />)}
                </div>
                <div className="p-4">
                    {['fr', 'en', 'ar'].map(lang => (
                        <div key={lang} style={{ display: activeLang === lang ? 'block' : 'none' }}>
                            <div className='mb-4'>
                                <label htmlFor={`name.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Nom ({lang.toUpperCase()})*</label>
                                <input type="text" id={`name.${lang}`} {...register(`name.${lang}`)} className={`w-full px-3 rounded-[3px] py-2 border ${errors.name?.[lang] ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} placeholder={`Nom de la catégorie en ${lang}`} />
                                {errors.name?.[lang] && <p className="mt-1 text-xs text-red-600">{errors.name[lang].message}</p>}
                            </div>
                            <div>
                                <label htmlFor={`description.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Description ({lang.toUpperCase()})</label>
                                <Controller name={`description.${lang}`} control={control} render={({ field }) => ( <JoditEditor value={field.value || ''} config={config(lang)} onBlur={newContent => field.onChange(newContent)} /> )}/>
                                {errors.description?.[lang] && <p className="mt-1 text-xs text-red-600">{errors.description[lang].message}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>
        <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
        <section id="sec2" ref={sectionTwoRef} className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Miniature</p><p className='text-sm font mt-1 text-gray-500'>Téléversez l'image miniature pour cette catégorie.</p></div>
          <div className='w-full flex flex-col gap-4'>
            <div className='border-gray-300 border cursor-pointer gap-4 w-full rounded-md py-8 flex flex-col justify-center items-center hover:border-blue-500 transition-colors' onClick={handleImageSelectClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleImageSelectClick()}><PiCloudArrowUpDuotone className='text-4xl text-gray-500' /><p className='text-sm font-semibold text-fblack'>Glissez-déposez ou cliquez pour sélectionner</p><p className='text-xs text-gray-500'>Une seule image (JPG, PNG, GIF, WEBP)</p></div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            {thumbnailPreview && (<div className="mt-1 w-32 h-32"><div className="relative group border border-gray-200 rounded overflow-hidden w-full h-full"><img src={thumbnailPreview} alt="Aperçu Miniature" className="h-full w-full object-cover" /><button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100" aria-label="Supprimer la miniature"> <PiXBold size={12} /> </button></div></div>)}
          </div>
        </section>
        <div className='my-12'> <div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc', margin: '0' }} /> </div>
        <section id="sec3" ref={sectionThreeRef} className='flex flex-col lg:flex-row gap-4 lg:gap-8 '>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Catégorie Parente</p><p className='text-sm font mt-1 text-gray-500'>Sélectionnez une catégorie parente (optionnel).</p></div>
          <div className='w-full flex flex-col gap-4'>
            <div className='border border-gray-200 rounded-md overflow-y-auto max-h-[300px]'>
              <div onClick={() => handleParentCategorySelect(null)} className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${selectedParentCategoryId === null ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}><PiStackDuotone className='text-gray-400 text-2xl shrink-0' /><div className='flex-grow'><p className='font-semibold text-sm text-gray-800'>Aucun Parent</p><p className='text-xs text-gray-500'>Définir comme catégorie principale</p></div><div className='shrink-0 ml-auto'>{selectedParentCategoryId === null ? (<PiCheckCircleFill className='text-blue-500 text-xl' />) : (<PiCircle className='text-gray-400 text-xl' />)}</div></div>
              {parentCategories.map((category) => { const isSelected = selectedParentCategoryId === category.id; return (<div key={category.id} onClick={() => handleParentCategorySelect(category.id)} className={`flex items-center gap-4 p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}><PiStackDuotone className='text-gray-400 text-2xl shrink-0' /><div className='flex-grow'><p className='font-semibold text-sm text-gray-800'>{category.name?.fr || category.name?.en || category.name}</p></div><div className='shrink-0 ml-auto'>{isSelected ? (<PiCheckCircleFill className='text-blue-500 text-xl' />) : (<PiCircle className='text-gray-400 text-xl' />)}</div></div>);})}
            </div>
            {selectedParentCategoryId && (<div className='flex items-center gap-2 mt-2 text-sm text-gray-600'><PiStackDuotone className='text-gray-400 text-lg shrink-0' /><span>Parent sélectionné: <span className='font-semibold'>{categories.find(c => c.id === selectedParentCategoryId)?.name}</span></span></div>)}
          </div>
        </section>
        <div className="flex bg-white mt-12 sticky bottom-0 py-4 border-gray-300 border-t z-10 -mx-4 px-4">
          <button type="submit" disabled={isLoading} className={`px-6 text-sm cursor-pointer ml-auto py-3 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>{isLoading ? 'Création...' : 'Créer Catégorie'}</button>
        </div>
      </form>
    </div>
  );
}