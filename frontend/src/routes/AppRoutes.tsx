import { Navigate, Route, Routes } from "react-router-dom"
import Login from "../pages/auth/Login"
import DashboardLayout from "../components/layout/DashboardLayout"
import Dashboard from "../pages/dashboard/Dashboard"
import ProtectedRoute from "./ProtectedRoute"
import Products from "../pages/products/Products"
import CreateProduct from "../pages/products/CreateProduct"
import EditProduct from "../pages/products/EditProduct"
import Categories from "../pages/categories/Categories"
import CreateCategory from "../pages/categories/CreateCategory"
import EditCategory from "../pages/categories/EditCategory"
import Suppliers from "../pages/suppliers/Suppliers"
import CreateSupplier from "../pages/suppliers/CreateSupplier"
import EditSupplier from "../pages/suppliers/EditSupplier"
import Inventory from "../pages/inventory/Inventory"
import Transactions from "../pages/transactions/Transactions"
import Users from "../pages/users/Users"
import CreateUser from "../pages/users/CreateUser"
import EditUser from "../pages/users/EditUser"
import AuditLogs from "../pages/auditLogs/AuditLogs"
import Email from "../pages/email/Email"
import ForgotPassword from "../pages/auth/ForgotPassword"
import ResetPassword from "../pages/auth/ResetPassword"

const AppRoutes = () => {
  return (  
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />} >
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />

                    <Route path="/products" element={<Products />} />
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
                        <Route path="/products/create" element={<CreateProduct />} />
                        <Route path="/products/:id/edit" element={<EditProduct />} />
                    </Route>

                    <Route path="/categories" element={<Categories />} />
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
                        <Route path="/categories/create" element={<CreateCategory />} />
                        <Route path="/categories/:id/edit" element={<EditCategory />} />
                    </Route>

                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
                        <Route path="/suppliers/create" element={<CreateSupplier />} />
                        <Route path="/suppliers/:id/edit" element={<EditSupplier />} />
                    </Route>
                    
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/transactions" element={<Transactions />} />                    

                    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
                        <Route path="/users" element={<Users />} />
                        <Route path="/users/create" element={<CreateUser />} />
                        <Route path="/users/:id/edit" element={<EditUser />} />

                        <Route path="/audit-logs" element={<AuditLogs />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                        <Route path="/email" element={<Email />} />
                    </Route>
                    
                </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
  )
}

export default AppRoutes