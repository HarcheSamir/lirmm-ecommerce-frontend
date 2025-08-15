// src/pages/Accounts/AccountCreate.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PagesHeader from '../../components/PagesHeader';
import { useFormWithValidation } from '../../hooks/useFormWithValidation';
import { inviteUserSchema } from '../../utils/schemas';
import { useUserStore } from '../../store/userStore';

export default function AccountCreate() {
  const navigate = useNavigate();
  const { roles, isLoading, fetchRoles, inviteUser } = useUserStore();
  const { register, handleSubmit, formState: { errors }, reset } = useFormWithValidation(inviteUserSchema);

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [fetchRoles, roles.length]);

  const onSubmit = async (data) => {
    const success = await inviteUser(data);
    if (success) {
      reset();
      navigate('/dashboard/accounts');
    }
  };

  return (
    <div className='flex flex-col'>
      <PagesHeader
        className={'px-4'}
        title="Invite a New User"
        breadcrumbs={[
          { label: 'Tableau de bord', link: '/dashboard' },
          { label: 'Comptes', link: '/dashboard/accounts' },
          { label: 'Inviter' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col px-4 mt-8'>
        <section id="sec1" className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
          <div className='w-full lg:w-[30%] lg:shrink-0 flex flex-col mb-4 lg:mb-0'>
            <p className='font-medium text-fblack text-[16px]'>User Details</p>
            <p className='text-sm font mt-1 text-gray-500'>Enter the user's name, email, and assign a role. They will receive an email to set their password.</p>
          </div>
          <div className='w-full flex flex-col gap-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className={`w-full px-3 rounded-md py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="e.g., John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className={`w-full px-3 rounded-md py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-primary focus:border-primary sm:text-sm`}
                  placeholder="e.g., user@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
              <select
                id="roleId"
                {...register("roleId")}
                className={`w-full px-3 rounded-md py-2 border ${errors.roleId ? 'border-red-500' : 'border-gray-300'} focus:ring-primary focus:border-primary sm:text-sm`}
                defaultValue=""
              >
                <option value="" disabled>Select a role...</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.roleId && <p className="mt-1 text-xs text-red-600">{errors.roleId.message}</p>}
            </div>
          </div>
        </section>

        <div className="flex bg-white mt-12 sticky bottom-0 py-4 border-gray-300 border-t z-10 -mx-4 px-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 text-sm cursor-pointer ml-auto py-3 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
          </button>
        </div>
      </form>
    </div>
  );
}