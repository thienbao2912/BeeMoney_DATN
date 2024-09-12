// src/App.js

import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  RouterProvider,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import ExpenseAdd from './pages/Client/Transaction/Expense/ExpenseAdd/ExpenseAdd';
import ExpenseList from './pages/Client/Transaction/Expense/ExpenseList/ExpenseList';
import ExpenseEdit from './pages/Client/Transaction/Expense/ExpenseEdit/ExpenseEdit';
import SavingGoalAdd from './pages/Client/SavingGoals/SavingGoalAdd/SavingGoalAdd';
import SavingGoalList from './pages/Client/SavingGoals/SavingGoalList/SavingGoalList';
import SavingGoalEdit from './pages/Client/SavingGoals/SavingGoalEdit/SavingGoalEdit';
import Home from './pages/Client/Home/Home';
import Login from './pages/Auth/Login/Login';
import IncomeAdd from './pages/Client/Transaction/Income/IncomeAdd/IncomeAdd';
import IncomeList from './pages/Client/Transaction/Income/IncomeList/IncomeList';
import IncomeEdit from './pages/Client/Transaction/Income/IncomeEdit/IncomeEdit';
import ClientLayout from './layouts/ClientLayout';
import AuthLayout from './layouts/AuthLayout';
import Budget from './pages/Client/Budget/budget';
import AddBudget from './pages/Client/Budget/add-budget/add-budget';
import BudgetDetail from './pages/Client/Budget/budget-detail/budget-detail';
import ProfileForm from './pages/Client/Profile/Profile';
import Categories from './pages/Client/Category/Categories';
import AddCategory from './pages/Client/Category/Add-Category/add-category';
import EditCategory from './pages/Client/Category/Update-Category/Update-Category';
import Register from './pages/Auth/Register/Register';
import Forgetpassword from './pages/Auth/ForgetPassword/ForgetPassword';
import PrivateRoute from './components/PrivateRoute';
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword';
// Import Admin Routes
import AdminRoutes from './pages/Admin/Router/AdminRoutes';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forget-password" element={<Forgetpassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* Route chứa token */}
        </Route>
        <Route element={<PrivateRoute element={<ClientLayout />} />}>
          <Route path="/" element={<Home />} />
          <Route path="/expense/add" element={<ExpenseAdd />} />
          <Route path="/expense/list" element={<ExpenseList />} />
          <Route path="/expense/edit/:id" element={<ExpenseEdit />} />
          <Route path="/saving-goal/add" element={<SavingGoalAdd />} />
          <Route path="/saving-goal/list" element={<SavingGoalList />} />
          <Route path="/saving-goal/edit/:id" element={<SavingGoalEdit />} />
          <Route path="/income/add" element={<IncomeAdd />} />
          <Route path="/income/list" element={<IncomeList />} />
          <Route path="/income/edit/:id" element={<IncomeEdit />} />
          <Route path="/add-budget" element={<AddBudget />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/budget-detail/:budgetId" element={<BudgetDetail />} />
          <Route path="/profile" element={<ProfileForm />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/edit-category/:id" element={<EditCategory />} />
        </Route>
        {/* Route cho Admin */}
        <Route path="/admin/*" element={<PrivateRoute element={<AdminRoutes />} requiredRole="admin" />} />
      </>

    )
  );

  return <RouterProvider router={router} />;
}

export default App;
