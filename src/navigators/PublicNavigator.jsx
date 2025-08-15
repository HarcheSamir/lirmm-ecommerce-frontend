import React from 'react'
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from '../pages/LoginPage';
import WithAuth from '../hocs/WithAuth'
import DashboardPage from '../pages/DashboardPage';
import DashboardNavigator from './DashboardNavigator';
import Test from '../pages/Test';
import NotFoundPage from '../pages/NotFoundPage';
import AcceptInvitationPage from '../pages/AcceptInvitationPage'; // <-- IMPORT NEW PAGE

export default function PublicNavigator() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} /> {/* <-- ADD NEW ROUTE */}
        <Route path="/test" element={<Test />} />
        <Route path="/dashboard/*" element={<WithAuth><DashboardPage /></WithAuth>} />
        <Route path="/" element={<WithAuth><DashboardNavigator /></WithAuth>} />
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </div>
  )
}