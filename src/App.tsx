/**
 * Root Application Component
 * 
 * Sets up routing, context providers, and role-based experiences.
 * 
 * Validates Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 18.4, 18.5
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './contexts/RoleContext';
import { MockDataProvider } from './contexts/MockDataContext';
import { RoleSwitcher } from './components/layouts/RoleSwitcher';

// Customer Pages (to be created)
import { CustomerHome } from './features/customer/CustomerHome';
import { LiveJob } from './features/customer/LiveJob';

// Worker Pages (to be created)
import { WorkerDashboard } from './features/worker/WorkerDashboard';
import { IncomingJob } from './features/worker/IncomingJob';
import { SkillPassport } from './features/worker/SkillPassport';

// Cooperative Pages (to be created)
import { OperationsDashboard } from './features/cooperative/OperationsDashboard';
import { DemandIntelligence } from './features/cooperative/DemandIntelligence';
import { SkillIntelligence } from './features/cooperative/SkillIntelligence';

function AppRoutes() {
  const { role } = useRole();

  return (
    <div className="min-h-screen bg-background-primary font-body">
      <RoleSwitcher />
      
      <Routes>
        {/* Customer Routes */}
        {role === 'customer' && (
          <>
            <Route path="/" element={<CustomerHome />} />
            <Route path="/job/:jobId" element={<LiveJob />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* Worker Routes */}
        {role === 'worker' && (
          <>
            <Route path="/" element={<WorkerDashboard />} />
            <Route path="/job/:jobId" element={<IncomingJob />} />
            <Route path="/passport" element={<SkillPassport />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* Cooperative Routes */}
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
      <RoleProvider>
        <MockDataProvider>
          <AppRoutes />
        </MockDataProvider>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;
