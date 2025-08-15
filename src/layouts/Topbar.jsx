import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import useLayoutStore from '../store/layoutStore';
import { 
    PiMagnifyingGlass, 
    PiBell, 
    PiUserCircle, 
    PiGear, 
    PiSignOut,
    PiList
} from "react-icons/pi";

// Dropdown Menu Component for the user profile
const ProfileDropdown = ({ user, onLogout, isOpen }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="py-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                    <PiUserCircle size={20} />
                    <span>My Profile</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                    <PiGear size={20} />
                    <span>Settings</span>
                </a>
            </div>
            <div className="p-2 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                    <PiSignOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default function Topbar() {
    const { user, logout } = useAuthStore();
    const { switchSidebar, switchMiniSidebar, sidebar, miniSidebar } = useLayoutStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const handleLogout = () => {
        setIsProfileOpen(false);
        logout();
    };

    // Effect to handle clicks outside the profile dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) {
        return <div className='w-full h-[70px] bg-white border-b border-gray-200' />;
    }

    return (
        <div className='w-full h-[70px] items-center px-4 md:px-6 gap-4 border-b border-gray-200 bg-white flex sticky top-0 z-20'>
            {/* --- Left Side: Menu Toggles --- */}
            <div className="flex items-center gap-2">
                <button onClick={switchMiniSidebar} className='p-2 rounded-full hidden lg:flex items-center justify-center hover:bg-gray-100'>
                    <PiList className='text-xl cursor-pointer text-zinc-600' />
                </button>
                <button onClick={switchSidebar} className={`p-2 rounded-full flex lg:hidden items-center justify-center hover:bg-gray-100 transition-all duration-300 ${sidebar && 'ml-[16rem]'}`}>
                    <PiList className='text-xl cursor-pointer text-zinc-600' />
                </button>
            </div>

            {/* --- Center: Search Bar --- */}
            <div className="relative flex-grow max-w-xl hidden md:block">
                <PiMagnifyingGlass className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search for products, orders, customers..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                />
            </div>

            {/* --- Right Side: Actions & Profile --- */}
            <div className="ml-auto flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <PiBell size={22} className="text-gray-600" />
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2"
                    >
                        <img
                            src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                            alt="User Avatar"
                            className="w-9 h-9 rounded-full object-cover border-2 border-transparent hover:border-primary transition-all"
                        />
                        <div className="hidden lg:flex flex-col items-start">
                            <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.role}</span>
                        </div>
                    </button>
                    <ProfileDropdown user={user} onLogout={handleLogout} isOpen={isProfileOpen} />
                </div>
            </div>
        </div>
    );
}