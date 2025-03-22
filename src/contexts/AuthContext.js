import { createContext, useContext, useState, ReactNode } from "react"

interface AuthContextType {
  token: string | null
  refreshToken: string | null
  login: (access: string, refresh: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"))
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refresh_token"))

  const login = (access: string, refresh: string) => {
    setToken(access)
    setRefreshToken(refresh)
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
  }

  const logout = () => {
    setToken(null)
    setRefreshToken(null)
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  return (
    <AuthContext.Provider value={{ token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}