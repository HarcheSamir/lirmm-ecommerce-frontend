import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PagesHeader from '../../components/PagesHeader';
import { HashLink } from 'react-router-hash-link';
import { useFormWithValidation } from '../../hooks/useFormWithValidation';
import {
  PiCloudArrowUpDuotone,
  PiXBold,
} from "react-icons/pi";
import { promotionSchema } from '../../utils/schemas'; 
import { useProductStore } from '../../store/productStore';

const LanguageTab = ({ lang, activeLang, setActiveLang }) => (
    <button type="button" onClick={() => setActiveLang(lang)} className={`px-4 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors duration-200 ${activeLang === lang ? 'border-primary text-primary bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {lang.toUpperCase()}
    </button>
);

const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        const pad = (num) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) { return ''; }
};

export default function PromotionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { promotion, fetchPromotionById, updatePromotion, isPromotionLoading, isUploading } = useProductStore();

  const [activeLang, setActiveLang] = useState('fr');
  const [activeSection, setActiveSection] = useState('sec1');
  const navItems = useMemo(() => [
    { label: 'Résumé', id: 'sec1' }, { label: 'Images', id: 'sec2' }, { label: 'Paramètres', id: 'sec3' },
  ], []);

  const { register, handleSubmit, formState: { errors }, reset } = useFormWithValidation(promotionSchema);

  const [bgImage, setBgImage] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState('');
  const bgFileInputRef = useRef(null);

  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const productFileInputRef = useRef(null);

  useEffect(() => {
    if (id) fetchPromotionById(id);
  }, [id, fetchPromotionById]);
  
  useEffect(() => {
    if (promotion) {
      reset({
        ...promotion,
        expiresAt: formatDateTimeForInput(promotion.expiresAt)
      });
      setBgImagePreview(promotion.imageUrl || '');
      setProductImagePreview(promotion.productImageUrl || '');
    }
  }, [promotion, reset]);

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px 0px -75% 0px', threshold: 0 };
    const observerCallback = (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = navItems.map(item => document.getElementById(item.id));
    sections.forEach((section) => { if (section) observer.observe(section); });
    return () => { sections.forEach((section) => { if (section) observer.unobserve(section); }); };
  }, [navItems]);

  const onSubmit = async (data) => {
    const promotionData = { 
        ...data, 
        imageUrl: promotion.imageUrl,
        productImageUrl: promotion.productImageUrl,
        imageFile: bgImage, 
        productImageFile: productImage 
    };
    const result = await updatePromotion(id, promotionData);
    if (result) {
      navigate('/dashboard/promotions');
    }
  };
  
  const handleFileChange = (event, setImage, setPreview) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(oldPreview => {
          if (oldPreview && oldPreview.startsWith('blob:')) URL.revokeObjectURL(oldPreview);
          return URL.createObjectURL(file);
      });
      setImage(file);
      event.target.value = null;
    }
  };

  const handleRemoveImage = (setPreview, setImage) => {
    setPreview(oldPreview => {
      if(oldPreview && oldPreview.startsWith('blob:')) URL.revokeObjectURL(oldPreview);
      return '';
    });
    setImage(null);
  };

  if (isPromotionLoading && !promotion) return <div className="p-6">Chargement...</div>;
  if (!promotion) return <div className="p-6">Promotion non trouvée.</div>;

  return (
    <div className="flex flex-col">
      <PagesHeader className={'px-4'} title="Modifier la Promotion" breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Promotions', link: '/dashboard/promotions' }, { label: 'Modifier' }]} />
      <nav className="mb-8 scrollbar-thumb-transparent scrollbar-track-transparent mx-4 pt-2 text-sm sticky top-0 bg-white z-10 border-b border-gray-300 flex gap-4 md:gap-8 overflow-x-auto">
        {navItems.map((item) => (<div key={item.id} className='flex flex-col items-center flex-shrink-0'><HashLink smooth to={`#${item.id}`} className={`px-3 py-2 rounded-md transition-colors duration-200 font-semibold whitespace-nowrap ${activeSection === item.id ? 'text-fblack' : 'text-gray-500 hover:text-fblack'}`}>{item.label}</HashLink><div className={`h-[2px] w-full mt-1 transition-colors duration-200 ${activeSection === item.id ? 'bg-fblack' : 'bg-transparent'}`} /></div>))}
      </nav>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col px-4'>
        <section id="sec1" className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Résumé</p><p className='text-sm font mt-1 text-gray-500'>Modifiez les textes de la promotion pour chaque langue.</p></div>
          <div className='w-full flex flex-col gap-6'>
            <div className="border border-gray-200 rounded-md">
              <div className="flex border-b border-gray-200 bg-gray-50/50">
                  {['fr', 'en', 'ar'].map(lang => <LanguageTab key={lang} lang={lang} activeLang={activeLang} setActiveLang={setActiveLang} />)}
              </div>
              <div className="p-4">
                {['fr', 'en', 'ar'].map(lang => (
                  <div key={lang} style={{ display: activeLang === lang ? 'block' : 'none' }}>
                    <div className='mb-4'>
                      <label htmlFor={`title.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Titre ({lang.toUpperCase()})*</label>
                      <input type="text" id={`title.${lang}`} {...register(`title.${lang}`)} className={`w-full px-3 rounded-[3px] py-2 border ${errors.title?.[lang] ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                      {errors.title?.[lang] && <p className="mt-1 text-xs text-red-600">{errors.title[lang].message}</p>}
                    </div>
                    <div className='mb-4'>
                      <label htmlFor={`subtitle.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Sous-titre ({lang.toUpperCase()})</label>
                      <input type="text" id={`subtitle.${lang}`} {...register(`subtitle.${lang}`)} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                     <div>
                      <label htmlFor={`ctaText.${lang}`} className="block text-sm font-medium text-gray-700 mb-1">Texte CTA ({lang.toUpperCase()})*</label>
                      <input type="text" id={`ctaText.${lang}`} {...register(`ctaText.${lang}`)} className={`w-full px-3 rounded-[3px] py-2 border ${errors.ctaText?.[lang] ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                      {errors.ctaText?.[lang] && <p className="mt-1 text-xs text-red-600">{errors.ctaText[lang].message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className='my-12'><div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc' }} /></div>
        <section id="sec2" className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
            <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Images</p><p className='text-sm font mt-1 text-gray-500'>Changez l'image de fond et l'image de produit.</p></div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Image de Fond*</p>
                    <div className='border-gray-300 border cursor-pointer gap-4 w-full rounded-md py-8 flex flex-col justify-center items-center hover:border-blue-500 transition-colors' onClick={() => bgFileInputRef.current?.click()} role="button"><PiCloudArrowUpDuotone className='text-4xl text-gray-500' /><p className='text-sm font-semibold text-fblack'>Cliquez pour changer</p></div>
                    <input type="file" ref={bgFileInputRef} onChange={(e) => handleFileChange(e, setBgImage, setBgImagePreview)} accept="image/*" className="hidden" />
                    {bgImagePreview && (<div className="mt-4 w-32 h-32"><div className="relative group border border-gray-200 rounded overflow-hidden w-full h-full"><img src={bgImagePreview} alt="Aperçu" className="h-full w-full object-cover" /><button type="button" onClick={() => handleRemoveImage(setBgImagePreview, setBgImage)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Supprimer"> <PiXBold size={12} /> </button></div></div>)}
                </div>
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Image de Produit (Optionnel)</p>
                    <div className='border-gray-300 border cursor-pointer gap-4 w-full rounded-md py-8 flex flex-col justify-center items-center hover:border-blue-500 transition-colors' onClick={() => productFileInputRef.current?.click()} role="button"><PiCloudArrowUpDuotone className='text-4xl text-gray-500' /><p className='text-sm font-semibold text-fblack'>Cliquez pour changer</p></div>
                    <input type="file" ref={productFileInputRef} onChange={(e) => handleFileChange(e, setProductImage, setProductImagePreview)} accept="image/*" className="hidden" />
                    {productImagePreview && (<div className="mt-4 w-32 h-32"><div className="relative group border border-gray-200 rounded overflow-hidden w-full h-full"><img src={productImagePreview} alt="Aperçu" className="h-full w-full object-cover" /><button type="button" onClick={() => handleRemoveImage(setProductImagePreview, setProductImage)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Supprimer"> <PiXBold size={12} /> </button></div></div>)}
                </div>
            </div>
        </section>
        <div className='my-12'><div style={{ height: 0, width: '100%', borderTop: '1px dashed #cccccc' }} /></div>
        <section id="sec3" className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
            <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'><p className='font-medium text-fblack text-[16px]'>Paramètres</p><p className='text-sm font mt-1 text-gray-500'>Modifiez le lien, la visibilité et la durée.</p></div>
            <div className="w-full flex flex-col gap-6">
                <div>
                    <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 mb-1">Lien CTA (URL)*</label>
                    <input type="url" id="ctaLink" {...register("ctaLink")} className={`w-full px-3 rounded-[3px] py-2 border ${errors.ctaLink ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                    {errors.ctaLink && <p className="mt-1 text-xs text-red-600">{errors.ctaLink.message}</p>}
                </div>
                 <div>
                    <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                    <input type="number" id="displayOrder" {...register("displayOrder")} className={`w-full px-3 rounded-[3px] py-2 border ${errors.displayOrder ? 'border-red-500' : 'border-gray-300'} focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} />
                    {errors.displayOrder && <p className="mt-1 text-xs text-red-600">{errors.displayOrder.message}</p>}
                </div>
                <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                    <input type="datetime-local" id="expiresAt" {...register("expiresAt", { valueAsDate: true })} className="w-full px-3 rounded-[3px] py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                 <div className="flex items-center">
                    <input id="isActive" type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Activer la promotion</label>
                </div>
            </div>
        </section>
        <div className="flex bg-white mt-12 sticky bottom-0 py-4 border-gray-300 border-t z-10 -mx-4 px-4">
          <button type="submit" disabled={isPromotionLoading || isUploading} className={`px-6 text-sm cursor-pointer ml-auto py-3 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isPromotionLoading || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>{isUploading ? 'Téléversement...' : (isPromotionLoading ? 'Mise à jour...' : 'Sauvegarder')}</button>
        </div>
      </form>
    </div>
  );
}