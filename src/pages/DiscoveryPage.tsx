// Discovery loop is handled inline in ResultsPage via the consultation data.
// This route redirects to results where the user can see the consultation in progress.
import { Navigate } from 'react-router-dom';
export default function DiscoveryPage() {
  return <Navigate to="/results" replace />;
}
