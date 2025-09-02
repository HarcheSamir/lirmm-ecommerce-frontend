import React, { useEffect, useState } from 'react';
import PagesHeader from '../components/PagesHeader';
import { useCurrencyStore } from '../store/currencyStore';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { PiPlus, PiCurrencyCircleDollar, PiPencilSimple, PiTrash, PiStarFill, PiXBold, PiFloppyDisk, PiXCircle } from 'react-icons/pi';
import { useFormWithValidation } from '../hooks/useFormWithValidation';
import { currencySchema } from '../utils/schemas';
import { getCurrencyFlag } from '../utils/currencyUtils';

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
            <div className="flex items-center">
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-200"></div>
                <div className="ml-4"><div className="h-4 w-12 rounded bg-gray-200"></div></div>
            </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 w-20 rounded bg-gray-200"></div></td>
        <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-6 w-10 rounded-full bg-gray-200"></div></td>
        <td className="whitespace-nowrap px-3 py-4 text-sm"><div className="h-4 w-32 rounded bg-gray-200"></div></td>
        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
            <div className="flex items-center justify-end gap-2">
                <div className="h-8 w-8 rounded bg-gray-200"></div>
                <div className="h-8 w-8 rounded bg-gray-200"></div>
            </div>
        </td>
    </tr>
);

const CurrencyRow = ({ rate, isEditing, onSave, onCancel, onEdit, onDelete, onSetBase, isSubmitting }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useFormWithValidation(currencySchema);

    useEffect(() => {
        if (isEditing) {
            reset({
                code: rate.code,
                rateVsBase: rate.isBase ? 1.0 : parseFloat(rate.rateVsBase),
            });
        }
    }, [isEditing, rate, reset]);

    const handleSave = (data) => {
        const payload = { ...data, isBase: rate.isBase };
        onSave(payload);
    };

    if (isEditing) {
        return (
            <tr className="bg-blue-50">
                <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0">
                    <div className="flex items-center">
                        <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center text-xl">
                            <span role="img" aria-label={`${rate.code} flag`}>{getCurrencyFlag(rate.code)}</span>
                        </div>
                        <div className="ml-4">
                            <input {...register("code")} type="text" maxLength="3" disabled={rate.code !== 'NEW'}
                                className={`w-20 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ${errors.code ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm`}
                            />
                        </div>
                    </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm">
                    <input {...register("rateVsBase")} type="number" step="any" disabled={rate.isBase}
                        className={`w-28 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ${rate.isBase ? 'bg-gray-100' : ''} ${errors.rateVsBase ? 'ring-red-500' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm`}
                    />
                </td>
                <td colSpan="2"></td>
                <td className="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <div className="flex items-center justify-end gap-x-2">
                        <button onClick={handleSubmit(handleSave)} disabled={isSubmitting} className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50"><PiFloppyDisk size={20} /></button>
                        <button onClick={onCancel} className="p-2 text-gray-500 hover:text-red-600"><PiXCircle size={20} /></button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150">
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                <div className="flex items-center">
                    <div className="h-7 w-7 flex-shrink-0 flex items-center justify-center text-xl"><span role="img" aria-label={`${rate.code} flag`}>{getCurrencyFlag(rate.code)}</span></div>
                    <div className="ml-4"><div className="font-medium text-gray-900">{rate.code}</div></div>
                </div>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{parseFloat(rate.rateVsBase).toFixed(4)}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {rate.isBase ? (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"><PiStarFill className="-ml-0.5 mr-1.5 h-3 w-3" />Base</span>
                ) : (
                    <label htmlFor={`toggle-${rate.code}`} className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id={`toggle-${rate.code}`} className="sr-only peer" checked={false} onChange={() => onSetBase(rate.code)} disabled={isSubmitting} />
                            <div className="block bg-gray-200 w-10 h-6 rounded-full peer-checked:bg-primary transition"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-full"></div>
                        </div>
                    </label>
                )}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(rate.lastUpdated).toLocaleString()}</td>
            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <div className="flex items-center justify-end">
                    <button onClick={() => onEdit(rate.code)} className="text-gray-400 hover:text-primary p-2"><PiPencilSimple size={18} /></button>
                    <button onClick={() => onDelete(rate.code)} className="text-gray-400 hover:text-red-600 p-2 ml-2"><PiTrash size={18} /></button>
                </div>
            </td>
        </tr>
    );
};


export default function CurrencyPage() {
    const { rates, isLoading, fetchRates, setBaseRate, deleteRate, upsertRate } = useCurrencyStore();
    const [editingRowId, setEditingRowId] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [rateToDelete, setRateToDelete] = useState(null);

    useEffect(() => { fetchRates(); }, [fetchRates]);

    const handleAddNew = () => setEditingRowId('NEW');
    const handleCancelEdit = () => setEditingRowId(null);
    
    const handleSave = async (data) => {
        const success = await upsertRate(data);
        if (success) {
            setEditingRowId(null);
        }
    };

    const handleOpenDeleteConfirm = (code) => { setRateToDelete(code); setIsDeleteConfirmOpen(true); };
    const handleCloseDeleteConfirm = () => { setRateToDelete(null); setIsDeleteConfirmOpen(false); };
    const handleConfirmDelete = async () => {
        if (rateToDelete) {
            await deleteRate(rateToDelete);
        }
        handleCloseDeleteConfirm();
    };

    const isSubmitting = useCurrencyStore(state => state.isLoading);
    const dataRows = editingRowId === 'NEW' ? [{ code: 'NEW', rateVsBase: '', isBase: false }, ...rates] : rates;

    return (
        <>
            <div className="flex flex-col px-4">
                <PagesHeader
                    title="Exchange Rates"
                    subtitle="Manage currency exchange rates for your store."
                    breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Taux de Change' }]}
                    icon={<PiCurrencyCircleDollar />}
                    actions={
                        <button onClick={handleAddNew} disabled={!!editingRowId} className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-600 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <PiPlus className="-ml-1 mr-2 h-5 w-5" />
                            Add Currency
                        </button>
                    }
                />
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                     <div className="flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase sm:pl-0">Currency</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Rate vs Base</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Base Currency</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Last Updated</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {isLoading && rates.length === 0 ? (
                                            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                                        ) : (
                                            dataRows.map((rate) => (
                                                <CurrencyRow
                                                    key={rate.code}
                                                    rate={rate}
                                                    isEditing={editingRowId === rate.code}
                                                    onSave={handleSave}
                                                    onCancel={handleCancelEdit}
                                                    onEdit={setEditingRowId}
                                                    onDelete={handleOpenDeleteConfirm}
                                                    onSetBase={setBaseRate}
                                                    isSubmitting={isSubmitting}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteConfirmationModal isOpen={isDeleteConfirmOpen} onClose={handleCloseDeleteConfirm} onConfirm={handleConfirmDelete} title="Delete Currency Rate" message={`Are you sure you want to delete the currency rate for '${rateToDelete}'? This action is not reversible.`} isLoading={isSubmitting} />
        </>
    );
}