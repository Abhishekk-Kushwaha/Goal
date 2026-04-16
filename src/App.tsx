import AppContent from "./AppContent";
import { AppErrorBoundary } from "./components/AppErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
