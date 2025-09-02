//src/layouts/Sidebar.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PiPackageDuotone,
  PiShoppingCartDuotone,
  PiUsersDuotone,
  PiQuestion,
  PiCalendarBlank,
  PiCaretUp,
  PiCaretDown,
  PiChartBarDuotone,
  PiStackDuotone,
  PiArrowUDownLeftDuotone,
  PiGear,
  PiCurrencyCircleDollar // <-- SURGICAL ADDITION: New Icon
} from 'react-icons/pi';
import { FaDotCircle } from "react-icons/fa";
import useLayoutStore from '../store/layoutStore';
import { useAuthStore } from '../store/authStore';

const navigationItems = [
  {
    name: 'Analytique',
    icon: PiChartBarDuotone,
    path: '/dashboard',
  },
  {
    name: 'Produits',
    icon: PiPackageDuotone,
    basePath: '/dashboard/products',
    permission: 'read:product',
    children: [
      { name: 'Liste', path: '/dashboard/products', permission: 'read:product' },
      { name: 'Créer', path: '/dashboard/products/create', permission: 'create:product' },
      { name: 'Modifier', path: '/dashboard/products/edit', hidden: true, permission: 'update:product' },
      { name: 'Stock', path: '/dashboard/products/stock', permission: 'adjust:stock' },
      { name: 'Avis', path: '/dashboard/products/reviews', permission: 'read:review' },
    ],
  },
  {
    name: 'Catégories',
    icon: PiStackDuotone,
    basePath: '/dashboard/categories',
    permission: 'read:category',
    children: [
      { name: 'Liste', path: '/dashboard/categories', permission: 'read:category' },
      { name: 'Créer', path: '/dashboard/categories/create', permission: 'create:category' },
    ],
  },
  {
    name: 'Commandes',
    icon: PiShoppingCartDuotone,
    basePath: '/dashboard/orders',
    permission: 'read:order',
    children: [
      { name: 'Liste', path: '/dashboard/orders', permission: 'read:order' },
      { name: 'Créer', path: '/dashboard/orders/create', permission: 'create:order' },
    ],
  },
  // --- START: SURGICAL ADDITION ---
  {
    name: 'Retours',
    icon: PiArrowUDownLeftDuotone,
    path: '/dashboard/returns',
    permission: 'read:returns',
  },
  // --- END: SURGICAL ADDITION ---
  {
    name: 'Comptes',
    icon: PiUsersDuotone,
    basePath: '/dashboard/accounts',
    permission: 'read:user',
    children: [
      { name: 'Rôles et Permissions', path: '/dashboard/accounts', permission: 'read:role' },
      { name: 'Créer', path: '/dashboard/accounts/create', permission: 'write:user' },
    ],
  },
  {
    name: 'Taux de Change',
    icon: PiCurrencyCircleDollar,
    path: '/dashboard/currencies',
    permission: 'write:currency',
  },
  {
    name: 'Centre d\'aide',
    icon: PiQuestion,
    path: '/dashboard/help',
  },
  {
    name: 'Calendrier',
    icon: PiCalendarBlank,
    path: '/dashboard/calendar',
  },
];

// The rest of the file remains completely unchanged.
const PopupMenu = ({ children, isOpen, targetRef, onMouseEnter, onMouseLeave }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [isOpen, targetRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-40 py-2"
      style={{ top: position.top, left: position.left }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>,
    document.body
  );
};

const SidebarSubItem = ({ item, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center py-1.5 px-2.5 rounded-md cursor-pointer group ${isActive ? 'text-primary font-medium' : 'text-gray-600 hover:text-gray-900'
      }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-primary' : 'bg-gray-400 group-hover:bg-gray-500'
        }`}
    />
    <span className="text-sm">{item.name}</span>
  </div>
);

const SidebarItem = ({
  item,
  isActive,
  isExpanded,
  onClick,
  onSubItemClick,
  activeSubItemName,
  miniSidebar
}) => {
  const hasChildren = item.children?.length > 0;
  const visibleChildren = item.children?.filter(c => !c.hidden) || [];
  const [showPopup, setShowPopup] = useState(false);
  const itemRef = useRef(null);
  const hidePopupTimer = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(hidePopupTimer.current);
    if (miniSidebar && hasChildren) {
      setShowPopup(true);
    }
  };

  const handleMouseLeave = () => {
    hidePopupTimer.current = setTimeout(() => {
      setShowPopup(false);
    }, 150);
  };

  useEffect(() => {
    return () => clearTimeout(hidePopupTimer.current);
  }, []);

  return (
    <div
      className="relative"
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        onClick={() => onClick(item.name)}
        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer group ${isActive
          ? 'bg-blue-100 text-primary font-medium'
          : 'text-gray-700 hover:bg-gray-100'
          } ${miniSidebar ? 'justify-center' : ''}`}
      >
        <div className={`flex items-center ${miniSidebar ? 'justify-center w-full' : ''}`}>
          <item.icon
            className={`w-5 h-5 ${miniSidebar ? 'mr-0 w-6 h-6' : 'mr-3'} flex-shrink-0 ${isActive
              ? 'text-blue-500'
              : 'text-gray-500 group-hover:text-gray-700'
              }`}
          />
          {!miniSidebar && <span className="text-sm">{item.name}</span>}
        </div>
        {hasChildren && !miniSidebar && (
          isExpanded ?
            <PiCaretUp className="w-4 h-4 text-gray-500" /> :
            <PiCaretDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {miniSidebar && hasChildren && (
        <PopupMenu
          isOpen={showPopup}
          targetRef={itemRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="font-medium text-sm px-3 py-2 border-b border-gray-100">
            {item.name}
          </div>
          <div className="mt-1">
            {visibleChildren.map((child) => (
              <div
                key={child.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubItemClick(child.path);
                  setShowPopup(false);
                }}
                className={`flex items-center py-1.5 px-3 cursor-pointer hover:bg-gray-100 ${isActive && activeSubItemName === child.name
                  ? 'text-primary font-medium'
                  : 'text-gray-600'
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive && activeSubItemName === child.name
                    ? 'bg-primary'
                    : 'bg-gray-400'
                    }`}
                />
                <span className="text-sm">{child.name}</span>
              </div>
            ))}
          </div>
        </PopupMenu>
      )}

      {hasChildren && !miniSidebar && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
        >
          <div className="overflow-hidden pl-6 space-y-1">
            {visibleChildren.map((child) => (
              <SidebarSubItem
                key={child.name}
                item={child}
                isActive={isActive && activeSubItemName === child.name}
                onClick={() => onSubItemClick(child.path)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getDefaultExpandedState = (items) => {
  const initialState = {};
  items.forEach(item => {
    if (item.children?.length > 0) {
      initialState[item.name] = true;
    }
  });
  return initialState;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sidebar, miniSidebar } = useLayoutStore();
  const { hasPermission } = useAuthStore();

  const filteredNavigationItems = useMemo(() => {
    return navigationItems
      .map(item => {
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }
        if (item.children) {
          const filteredChildren = item.children.filter(child => !child.permission || hasPermission(child.permission));
          if (filteredChildren.length === 0) {
            return item.path ? { ...item, children: [] } : null;
          }
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(Boolean);
  }, [hasPermission]);

  const [expanded, setExpanded] = useState(() => getDefaultExpandedState(filteredNavigationItems));

  const handleToggleExpand = (itemName) => {
    const item = filteredNavigationItems.find(i => i.name === itemName);
    if (!item?.children?.length) return;
    setExpanded(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const handleItemClick = (itemName) => {
    const item = filteredNavigationItems.find(i => i.name === itemName);
    const hasChildren = item?.children?.length > 0;
    if (hasChildren) {
      if (!miniSidebar) handleToggleExpand(itemName);
    } else if (item?.path && pathname !== item.path) {
      navigate(item.path);
    }
  };

  const handleSubItemClick = (childPath) => {
    if (childPath && pathname !== childPath) navigate(childPath);
  };

  return (
    <div
      className={`font-semibold shrink-0 h-screen bg-white border-r overflow-hidden
        border-gray-200 flex flex-col duration-200 w-0
        ${miniSidebar ? 'lg:w-16' : 'lg:w-64'}
        ${sidebar ? 'w-64 z-50' : 'w-0'}`
      }
    >
      <div className={`p-4 pt-5 pb-3 flex items-center mb-4 ${miniSidebar ? 'justify-center' : ''}`}>
        <div className="bg-primary p-1 rounded-lg">
          <FaDotCircle className="text-white text-l" />
        </div>
        {!miniSidebar && (
          <span className="text-xl ml-2 font-bold text-gray-800">
            Ec<span className='text-primary'>o</span>m
          </span>
        )}
      </div>

      <nav
        className={`
          flex-grow ${miniSidebar ? 'ml-2' : 'pl-3'} pr-2 space-y-1 overflow-y-scroll
          scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent
          hover:scrollbar-thumb-gray-400 hover:scrollbar-track-transparent scrollbar-thumb-rounded-full
        `}
      >
        {filteredNavigationItems.map((item) => {
          const hasChildren = item.children?.length > 0;
          let isActive = false;
          let activeSubItemName = null;

          if (hasChildren) {
            isActive = (item.basePath && pathname.startsWith(item.basePath));
            const activeChild = item.children.find(child => child.path === pathname);
            if (activeChild) activeSubItemName = activeChild.name;
          } else {
            isActive = item.path === pathname;
          }

          return (
            <SidebarItem
              key={item.name}
              item={item}
              isActive={isActive}
              activeSubItemName={activeSubItemName}
              isExpanded={!!expanded[item.name]}
              onClick={handleItemClick}
              onSubItemClick={handleSubItemClick}
              miniSidebar={miniSidebar}
            />
          );
        })}
      </nav>
    </div>
  );
}