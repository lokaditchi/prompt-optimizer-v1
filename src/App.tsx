import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SimpleOptimizer } from '@/components/prompt/SimpleOptimizer'
import { TemplateLibrary } from '@/components/templates/TemplateLibrary'
import { TestRunner } from '@/components/testing/TestRunner'
import { MetricsPanel } from '@/components/metrics/MetricsPanel'
import { SharePanel } from '@/components/sharing/SharePanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { ToastContainer } from '@/components/ui/Toast'
import { useTheme } from '@/hooks/useTheme'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function App() {
  // Apply theme to document
  useTheme()
  // Register global keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SimpleOptimizer />} />
          <Route path="templates" element={<TemplateLibrary />} />
          <Route path="test" element={<TestRunner />} />
          <Route path="metrics" element={<MetricsPanel />} />
          <Route path="share" element={<SharePanel />} />
          <Route path="settings" element={<SettingsPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  )
}
