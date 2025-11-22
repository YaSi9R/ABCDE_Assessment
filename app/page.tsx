"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LoginForm from "@/components/auth/login-form"
import SignupForm from "@/components/auth/signup-form"
import ItemsList from "@/components/shop/items-list"

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    const storedUserId = localStorage.getItem("userId")
    if (storedToken && storedUserId) {
      setToken(storedToken)
      setUserId(Number.parseInt(storedUserId))
      setIsLoggedIn(true)
      router.replace("/shop")
    } else {
      setIsLoggedIn(false)
      router.replace("/auth/login")
    }
    setIsLoading(false)
  }, [router])

  const handleLoginSuccess = (newToken: string, newUserId: number) => {
    localStorage.setItem("authToken", newToken)
    localStorage.setItem("userId", newUserId.toString())
    setToken(newToken)
    setUserId(newUserId)
    setIsLoggedIn(true)
    router.replace("/shop")
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userId")
    setToken(null)
    setUserId(null)
    setIsLoggedIn(false)
    setShowSignup(false)
    router.replace("/auth/login")
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isLoggedIn) {
    return showSignup ? (
      <SignupForm onSignupSuccess={() => setShowSignup(false)} onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  return <ItemsList token={token!} userId={userId!} onLogout={handleLogout} />
}
