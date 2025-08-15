// src/pages/Accounts/AccountList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import {
    PiArrowRight, PiUsersDuotone, PiCaretUpDown, PiPackageDuotone, PiKeyDuotone,
    PiWarehouseDuotone, PiShoppingCartDuotone, PiX, PiPencilSimpleLine, PiTrash,
    PiShieldCheckDuotone
} from 'react-icons/pi';
import PagesHeader from '../../components/PagesHeader';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore'; // <-- IMPORT AUTH STORE
import { roleSchema } from '../../utils/schemas';

// Reusable Role Form Modal
const RoleFormModal = ({ isOpen, onClose, roleToEdit }) => {
    const { permissions, fetchPermissions, createRole, updateRole, isLoading } = useUserStore();
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    
    const isEditMode = !!roleToEdit;
    const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(roleSchema) });

    useEffect(() => {
        if (isOpen) {
            fetchPermissions();
            if (isEditMode && roleToEdit) {
                reset({ name: roleToEdit.name, description: roleToEdit.description });
                setSelectedPermissionIds(roleToEdit.permissions.map(p => p.id));
            } else {
                reset({ name: '', description: '' });
                setSelectedPermissionIds([]);
            }
        }
    }, [isOpen, isEditMode, roleToEdit, fetchPermissions, reset]);
    
    const permissionGroups = useMemo(() => {
        if (!permissions || permissions.length === 0) return {};
        const iconMap = { user: PiUsersDuotone, role: PiKeyDuotone, product: PiPackageDuotone, category: PiPackageDuotone, stock: PiWarehouseDuotone, order: PiShoppingCartDuotone, 'my-orders': PiShoppingCartDuotone, default: PiShieldCheckDuotone };
        return permissions.reduce((acc, permission) => {
            const [action, resource] = permission.name.split(':');
            if (!resource) return acc;
            const groupName = resource.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (!acc[groupName]) {
                acc[groupName] = { icon: iconMap[resource] || iconMap.default, description: `Access control for ${resource}`, actions: {} };
            }
            acc[groupName].actions[action] = permission;
            return acc;
        }, {});
    }, [permissions]);

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissionIds(prev => prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]);
    };

    const onSubmit = async (data) => {
        if (selectedPermissionIds.length === 0) {
            toast.warn("A role must have at least one permission.");
            return;
        }
        const payload = { ...data, permissionIds: selectedPermissionIds };
        const success = isEditMode ? await updateRole(roleToEdit.id, payload) : await createRole(payload);
        if (success) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold whitespace-nowrap text-gray-800">{isEditMode ? 'Edit Role' : 'Create Role'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"><PiX size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Role name</label>
                            <input type="text" {...register("name")} className="w-full bg-gray-50/80 p-2.5 border border-gray-200 rounded-md focus:ring-primary focus:border-primary" disabled={isEditMode && ['ADMIN', 'Customer'].includes(roleToEdit.name)} />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea {...register("description")} rows="4" className="w-full bg-gray-50/80 p-2.5 border border-gray-200 rounded-md focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        <div className='space-y-1'>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Permission</h3>
                            {Object.entries(permissionGroups).map(([groupName, { icon: Icon, description, actions }]) => (
                                <div key={groupName} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                                    <div className="flex items-center gap-4">
                                        <Icon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{groupName}</p>
                                            <p className="text-sm text-gray-500">{description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        {Object.entries(actions).map(([action, permission]) => (
                                            <button type="button" key={permission.id} onClick={() => handlePermissionToggle(permission.id)}
                                                className={`px-5 py-1.5 text-sm rounded-md border w-24 text-center capitalize ${selectedPermissionIds.includes(permission.id) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="p-4 bg-gray-50 border-t flex justify-end">
                        <button type="submit" disabled={isLoading} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                            {isLoading ? "Saving..." : "Save Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Page Component
export default function AccountList() {
    const { hasPermission } = useAuthStore(); // <-- GET PERMISSION CHECKER
    const { users, roles, isLoading, fetchUsers, fetchRoles, updateUserRole, toggleUserStatus, deleteRole } = useUserStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    useEffect(() => { fetchUsers(); fetchRoles(); }, [fetchUsers, fetchRoles]);

    const canWriteRole = hasPermission('write:role');
    const canWriteUser = hasPermission('write:user');
    const canDeleteUser = hasPermission('delete:user');

    const handleOpenCreateModal = () => { setEditingRole(null); setIsModalOpen(true); };
    const handleOpenEditModal = (role) => { setEditingRole(role); setIsModalOpen(true); };
    const handleDeleteRole = async (role) => { if (window.confirm(`Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`)) { await deleteRole(role.id); } };
    const handleStatusChange = async (userId, currentStatus) => { if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) { await toggleUserStatus(userId, !currentStatus); } };
    const handleRoleChange = async (userId, newRoleId) => { await updateUserRole(userId, newRoleId); };

    return (
        <div className='flex flex-col p-4 gap-8'>
            {canWriteRole && <RoleFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} roleToEdit={editingRole} />}
            <div className="flex items-center justify-between">
                <PagesHeader className="pb-0 mt-0" title="Roles & Permissions" breadcrumbs={[{ label: 'Tableau de bord', link: '/dashboard' }, { label: 'Comptes', link: '/dashboard/accounts' },]} />
                {canWriteRole && (
                    <button onClick={handleOpenCreateModal} className="bg-primary whitespace-nowrap text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Create role
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div key={role.id} className="bg-gray-50/80 rounded-xl p-5 border border-gray-200/80 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-800">{role.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 flex-grow h-16">{role.description || "No description provided."}</p>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex -space-x-2">
                                {(role.users || []).slice(0, 3).map((user) => (
                                    <img key={user.id} src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-8 h-8 rounded-full border-2 border-gray-50" title={user.name}/>
                                ))}
                                {(role.userCount || 0) > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-gray-50">
                                        +{(role.userCount) - 3}
                                    </div>
                                )}
                            </div>
                            {canWriteRole && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDeleteRole(role)} className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled={['ADMIN', 'Customer'].includes(role.name)}><PiTrash size={16}/></button>
                                    <button onClick={() => handleOpenEditModal(role)} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                                        Edit role <PiArrowRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">All accounts</h2>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="p-4 w-4"><input type="checkbox" /></th>
                                    <th scope="col" className="px-6 py-3 flex items-center gap-1">Name <PiCaretUpDown /></th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Last online</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading && users.length === 0 ? (<tr><td colSpan="6" className="text-center p-8 text-gray-500">Loading...</td></tr>)
                                    : users.map(user => (
                                        <tr key={user.id} className="bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 align-middle">
                                            <td className="p-4"><input type="checkbox" /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{user.name}</p>
                                                        <p className="text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => canDeleteUser && handleStatusChange(user.id, user.isActive)} className="cursor-pointer" disabled={!canDeleteUser}>
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                                                        {user.isActive ? 'Active' : 'Deactivated'}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}<br />
                                                <span className="text-gray-400 text-xs">{new Date(user.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role.id}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                                    disabled={isLoading || !canWriteUser || user.role.name === 'ADMIN'}
                                                >
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    {canWriteUser && <button className="p-2 rounded-full hover:bg-gray-100 hover:text-primary"><PiPencilSimpleLine /></button>}
                                                    {canDeleteUser && <button className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500"><PiTrash /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}