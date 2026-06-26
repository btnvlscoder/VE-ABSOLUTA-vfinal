import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Outlet /> 
      </div>
    </div>
  );
};

export default MainLayout;