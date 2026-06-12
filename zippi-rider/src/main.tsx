import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './index.css';
import { RiderProvider, useRider } from './context/RiderContext';
import Shell from './components/Shell';
import Login from './pages/Login';
import Home from './pages/Home';
import Deliveries from './pages/Deliveries';
import OrderDetail from './pages/OrderDetail';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import { PageLoader } from './components/ui';

function RequireAuth() {
  const { user, loading } = useRider();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RiderProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<Shell />}>
              <Route path="/" element={<Home />} />
              <Route path="/deliver" element={<Deliveries />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RiderProvider>
  </React.StrictMode>
);
