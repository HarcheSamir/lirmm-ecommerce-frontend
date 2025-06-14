import React from 'react'
import { Route, Routes, Navigate } from "react-router-dom";
import NotFoundPage from '../pages/NotFoundPage';
import useLayoutStore from '../store/layoutStore';
import ProductList from '../pages/Products/ProductList'
import ProductCreate from '../pages/Products/ProductCreate'
import ProductEdit from '../pages/Products/ProductEdit'; // <-- IMPORT NEW COMPONENT
import OrderList from '../pages/Orders/OrderList'
import OrderCreate from '../pages/Orders/OrderCreate'
import AccountList from '../pages/Accounts/AccountList'
import AccountCreate from '../pages/Accounts/AccountCreate'
import CategoryCreate from '../pages/Categories/CategoryCreate';
import CategoryList from '../pages/Categories/CategoryList';
import Stock from '../pages/Products/Stock';
import ReviewsList from '../pages/Products/ReviewsList'
import Statistics from '../pages/Statistics'
export default function DashboardNavigator() {
  const { swithSidebar } = useLayoutStore()
  return (
    <div className='h-full overflow-y-scroll '>
      <Routes>
        <Route path="/" element={<Statistics />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/create" element={<ProductCreate />} />
        <Route path="/products/edit/:id" element={<ProductEdit />} /> {/* <-- ADD NEW ROUTE */}
        <Route path="/products/stock" element={<Stock />} />
        <Route path="/products/reviews" element={<ReviewsList />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/create" element={<OrderCreate />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/categories/create" element={<CategoryCreate />} />
        <Route path="/accounts" element={<AccountList />} />
        <Route path="/accounts/create" element={<AccountCreate />} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </div>
  )
}