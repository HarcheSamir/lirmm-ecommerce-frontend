import React from 'react'
import { Route, Routes } from "react-router-dom";

// Import the permission HOC
import WithPermission from '../hocs/WithPermission';

import NotFoundPage from '../pages/NotFoundPage';
import ProductList from '../pages/Products/ProductList'
import ProductCreate from '../pages/Products/ProductCreate'
import ProductEdit from '../pages/Products/ProductEdit';
import OrderList from '../pages/Orders/OrderList'
import OrderCreate from '../pages/Orders/OrderCreate'
import OrderDetail from '../pages/Orders/OrderDetail';
import AccountList from '../pages/Accounts/AccountList'
import AccountCreate from '../pages/Accounts/AccountCreate'
import CategoryCreate from '../pages/Categories/CategoryCreate';
import CategoryList from '../pages/Categories/CategoryList';
import Stock from '../pages/Products/Stock';
import StockHistory from '../pages/Products/StockHistory';
import ReviewsList from '../pages/Products/ReviewsList'
import Statistics from '../pages/Statistics'

export default function DashboardNavigator() {
  return (
    <div className='h-full overflow-y-scroll '>
      <Routes>
        {/* Public dashboard pages (all authenticated users) */}
        <Route path="/" element={<Statistics />} />

        {/* Product Routes */}
        <Route path="/products" element={<WithPermission requiredPermission="read:product"><ProductList /></WithPermission>} />
        <Route path="/products/create" element={<WithPermission requiredPermission="create:product"><ProductCreate /></WithPermission>} />
        <Route path="/products/edit/:id" element={<WithPermission requiredPermission="update:product"><ProductEdit /></WithPermission>} />
        <Route path="/products/stock" element={<WithPermission requiredPermission="adjust:stock"><Stock /></WithPermission>} />
        <Route path="/products/stock/history/:variantId" element={<WithPermission requiredPermission="adjust:stock"><StockHistory /></WithPermission>} />
        <Route path="/products/reviews" element={<WithPermission requiredPermission="read:review"><ReviewsList /></WithPermission>} />

        {/* Order Routes */}
        <Route path="/orders" element={<WithPermission requiredPermission="read:order"><OrderList /></WithPermission>} />
        <Route path="/orders/create" element={<WithPermission requiredPermission="create:order"><OrderCreate /></WithPermission>} />
        <Route path="/orders/:id" element={<WithPermission requiredPermission="read:order"><OrderDetail /></WithPermission>} />

        {/* Category Routes */}
        <Route path="/categories" element={<WithPermission requiredPermission="read:category"><CategoryList /></WithPermission>} />
        <Route path="/categories/create" element={<WithPermission requiredPermission="create:category"><CategoryCreate /></WithPermission>} />

        {/* Account & Role Routes */}
        <Route path="/accounts" element={<WithPermission requiredPermission="read:user"><AccountList /></WithPermission>} />
        <Route path="/accounts/create" element={<WithPermission requiredPermission="write:user"><AccountCreate /></WithPermission>} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}