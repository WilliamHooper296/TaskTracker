import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function GuestRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch(`${API_URL}/verifyUser`, {
          credentials: 'include',
        });

        if (response.ok) {
          navigate('/homepage', { replace: true });
          return;
        }
      } catch (e) {
        console.error('Error verifying guest route: ', e);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return children;
}

export default GuestRoute;
