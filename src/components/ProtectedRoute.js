"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Layout } from "./Layout"

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, isAdmin, isSales, isAccountant } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" />
  }

  // Check if a specific role is required
  if (requiredRole) {
    if (
      (requiredRole === "admin" && !isAdmin) ||
      (requiredRole === "sales" && !isSales && !isAdmin) ||
      (requiredRole === "accountant" && !isAccountant && !isAdmin)
    ) {
      return <Navigate to="/" />
    }
  }

  return <Layout>{children}</Layout>
}

export default ProtectedRoute

