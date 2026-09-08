import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole, type Role } from './contexts/RoleContext';
import { MockDataProvider } from './contexts/MockDataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Header } from './components/layouts/Header';
import { Footer } from './components/layouts/Footer';
import { NotificationToast } from './components/notifications/NotificationToast';

// Auth Pages
import { AuthLanding } from './features/auth/AuthLanding';

// Customer Pages
import { CustomerHome } from './features/customer/CustomerHome';
import { LiveJob } from './features/customer/LiveJob';

// Worker Pages
import { WorkerDashboard } from './features/worker/WorkerDashboard';
import { IncomingJob } from './features/worker/IncomingJob';
import { SkillPassport } from './features/worker/SkillPassport';

// Cooperative Pages
import { OperationsDashboard } from './features/cooperative/OperationsDashboard';
import { DemandIntelligence } from './features/cooperative/DemandIntelligence';
import { SkillIntelligence } from './features/cooperative/SkillIntelligence';

function AppRoutes() {
  const { role, switchRole } = useRole();
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (role === 'cooperative' && user.role !== 'admin' && user.role !== 'cooperative') {
        // User doesn't have cooperative access, switch them back to their actual role
        const userRole = user.role === 'admin' ? 'cooperative' : user.role;
        switchRole(userRole as Role);
      }
    }
  }, [role, user?.role, isAuthenticated, switchRole]);

  return (
    <div className="flex min-h-screen flex-col bg-background-primary font-body">
      <Header />
      <main className="flex-1">
        {!isAuthenticated ? (
          <AuthLanding />
        ) : (
          <Routes>
            {role === 'customer' && (
              <>
                <Route path="/" element={<CustomerHome />} />
                <Route path="/job/:jobId" element={<LiveJob />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
            {role === 'worker' && (
              <>
                <Route path="/" element={<WorkerDashboard />} />
                <Route path="/job/:jobId" element={<IncomingJob />} />
                <Route path="/passport" element={<SkillPassport />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
            {role === 'cooperative' && (
              <>
                <Route path="/" element={<OperationsDashboard />} />
                <Route path="/intelligence/demand" element={<DemandIntelligence />} />
                <Route path="/intelligence/skills" element={<SkillIntelligence />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        )}
      </main>
      <Footer />
      <NotificationToast />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <RoleProvider>
            <MockDataProvider>
              <AppRoutes />
            </MockDataProvider>
          </RoleProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
