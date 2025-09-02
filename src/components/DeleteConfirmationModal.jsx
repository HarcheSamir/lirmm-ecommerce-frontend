import React from 'react';
import { PiWarningCircleDuotone, PiXBold } from 'react-icons/pi';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <PiWarningCircleDuotone className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
              {title || 'Confirm Deletion'}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message || 'Are you sure you want to proceed? This action cannot be undone.'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            disabled={isLoading}
            className={`inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onConfirm}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <PiXBold size={20} />
        </button>
      </div>
    </div>
  );
}