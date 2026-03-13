import { useState, useEffect } from "react"
import { LoginPage } from "./auth.jsx"
import SchoolManagement from "./school-management.jsx"
import { auth } from "./services/api.js"

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    auth.me()
      .then(user => { if (user) setCurrentUser(user) })
      .finally(() => setChecking(false))
  }, [])

  const handleLogout = () => {
    auth.logout()
    setCurrentUser(null)
  }

  if (checking) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#64748B", fontSize: 15
      }}>
        Chargement...
      </div>
    )
  }

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />
  }

  return <SchoolManagement currentUser={currentUser} onLogout={handleLogout} />
}
