import { Routes, Route, Navigate } from 'react-router-dom'

// ── Layout ────────────────────────────────────────────────────────────────────
import AppShell from './components/AppShell.jsx'

// ── Context ───────────────────────────────────────────────────────────────────
import { CrisisProvider }         from './context/CrisisContext.jsx'
import { RiskProvider }           from './context/RiskContext.jsx'
import { AIProvider }             from './context/AIContext.jsx'
import { VendorProvider }         from './context/VendorContext.jsx'
import { IncidentProvider }       from './context/IncidentContext.jsx'
import { QuantificationProvider } from './context/QuantificationContext.jsx'
import { RegulatoryProvider }     from './context/RegulatoryContext.jsx'
import { AppQueryProvider }       from './providers/QueryProvider.jsx'

// ── Page imports ──────────────────────────────────────────────────────────────
import LoginPage              from './pages/LoginPage.jsx'
import NotFound               from './pages/NotFound.jsx'
import ERMPlatform            from './pages/ERMPlatform.jsx'
import SOPPlaybookEN          from './pages/SOPPlaybookEN.jsx'
import SOPPlaybookAR          from './pages/SOPPlaybookAR.jsx'
import NRECDashboard          from './pages/NRECDashboard.jsx'
import AIRiskAssistant        from './pages/AIRiskAssistant.jsx'
import AIAgentView            from './pages/AIAgentView.jsx'
import VendorManagement       from './pages/VendorManagement.jsx'
import IncidentManagement     from './pages/IncidentManagement.jsx'
import IncidentDetail         from './pages/IncidentDetail.jsx'
import RiskQuantification     from './pages/RiskQuantification.jsx'
import RegulatoryIntelligence from './pages/RegulatoryIntelligence.jsx'
import ComplianceDashboard    from './pages/ComplianceDashboard.jsx'
import SumoodPage             from './pages/SumoodPage.jsx'
import BIAAssetRegistry       from './pages/BIAAssetRegistry.jsx'
import ExecutiveBriefing      from './pages/ExecutiveBriefing.jsx'
import AISystemDashboard     from './pages/admin/AISystemDashboard.jsx'

// ── Protected Route Guard ─────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('grc_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppQueryProvider>
    <CrisisProvider>
    <RiskProvider>
    <AIProvider>
    <VendorProvider>
    <IncidentProvider>
    <QuantificationProvider>
    <RegulatoryProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/erm" replace />} />
          <Route path="/erm"            element={<ERMPlatform />} />
          <Route path="/sop-en"         element={<SOPPlaybookEN />} />
          <Route path="/sop-ar"         element={<SOPPlaybookAR />} />
          <Route path="/nrec"           element={<NRECDashboard />} />
          <Route path="/ai-risk"        element={<AIRiskAssistant />} />
          <Route path="/ai-agent"       element={<AIAgentView />} />
          <Route path="/vendors"        element={<VendorManagement />} />
          <Route path="/incidents"      element={<IncidentManagement />} />
          <Route path="/incidents/:id"  element={<IncidentDetail />} />
          <Route path="/quantification" element={<RiskQuantification />} />
          <Route path="/regulatory"     element={<RegulatoryIntelligence />} />
          <Route path="/compliance"     element={<ComplianceDashboard />} />
          <Route path="/sumood"         element={<SumoodPage />} />
          <Route path="/bia-assets"     element={<BIAAssetRegistry />} />
          <Route path="/executive"      element={<ExecutiveBriefing />} />
          <Route path="/admin/ai"       element={<AISystemDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RegulatoryProvider>
    </QuantificationProvider>
    </IncidentProvider>
    </VendorProvider>
    </AIProvider>
    </RiskProvider>
    </CrisisProvider>
    </AppQueryProvider>
  )
}
