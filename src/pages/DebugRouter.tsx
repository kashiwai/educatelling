import { useLocation } from 'react-router-dom';

export default function DebugRouter() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Debug Router</h1>
        <div className="space-y-2">
          <p><strong>Current pathname:</strong> {location.pathname}</p>
          <p><strong>Current search:</strong> {location.search}</p>
          <p><strong>Current hash:</strong> {location.hash}</p>
          <p><strong>Full URL:</strong> {window.location.href}</p>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">
            If you see this page, it means the routing is working but the admin route is not matching correctly.
          </p>
        </div>
      </div>
    </div>
  );
}