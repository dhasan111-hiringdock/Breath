import { BrowserRouter as Router, Routes, Route } from "react-router";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";
import OfflineIndicator from "@/react-app/components/OfflineIndicator";
import HomePage from "@/react-app/pages/Home";
// import AuthCallback from "@/react-app/pages/AuthCallback";

export default function App() {
  return (
    <ErrorBoundary>
        <OfflineIndicator />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/auth/callback" element={<AuthCallback />} /> */}
          </Routes>
        </Router>
    </ErrorBoundary>
  );
}
