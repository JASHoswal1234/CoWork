import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './contexts/RoleContext';
import { MockDataProvider } from './contexts/MockDataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleSwitcher } from './components/layouts/RoleSwitcher';

// Auth Pages
import { CustomerAuth } from './features/auth/CustomerAuth';
import { WorkerAuth } from './features/auth/WorkerAuth';
import { CooperativeAuth } from './features/auth/CooperativeAuth';

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
  const { role } = useRole();
  const { isAuthenticated } = useAuth();

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    if (role === 'worker') return <WorkerAuth onSuccess={() => {}} />;
    if (role === 'cooperative') return <CooperativeAuth onSuccess={() => {}} />;
    return <CustomerAuth onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background-primary font-body">
      <RoleSwitcher />
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
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <MockDataProvider>
            <AppRoutes />
          </MockDataProvider>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
