import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../../../components/PrivateRoute';
import Dashboard from '../Dashboard/Dashboard';
import Category from '../../../pages/Admin/Category/Category';
import AddCategory from '../../../pages/Admin/Category/AddCategory';
import User from '../../../pages/Admin/User/User';
import AddUser from '../../../pages/Admin/User/AddUser';
import UpdateUser from '../../../pages/Admin/User/UpdateUser'; 
import Profile from '../../../pages/Admin/Profile/Profile';
import EditCategory from '../../../pages/Admin/Category/EditCategory';
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="users" element={<User />} />
      <Route path="users/add" element={<AddUser />} />
      <Route path="users/edit/:id" element={<UpdateUser />} /> 
      <Route path="categories" element={<Category />} />
      <Route path="categories/add" element={<AddCategory />} />
      <Route path="categories/edit/:id" element={<EditCategory />} />
      <Route path="profile" element={<Profile />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      <Route path="categories/edit/:id" element={<EditCategory />} />
    </Routes>
  );
};

export default AdminRoutes;
