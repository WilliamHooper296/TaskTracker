import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${API_URL}/verifyUser`, {
          credentials: 'include',
        });
        if (!response.ok) {
          navigate('/login', { replace: true });
          return;
        }

        setAuth(true);
      } catch (e) {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  if (loading || !auth) {
    return <p>Loading...</p>;
  }
  return children;
}

export default ProtectedRoute;
