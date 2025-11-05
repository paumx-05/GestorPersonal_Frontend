// Layout del dashboard con sidebar
// Este layout envuelve todas las páginas del dashboard e incluye el sidebar
// Protege las rutas del dashboard con autenticación

'use client'

import Sidebar from '@/components/Sidebar'
import { ProtectedRoute } from '@/middleware/routeProtection'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main-content">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}

