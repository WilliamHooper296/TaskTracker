import { useNavigate } from 'react-router-dom';
import DailyList from './DailyList';
import GoalList from './GoalList';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function Homepage() {
  const navigate = useNavigate();

  async function signOut() {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return;
      } else {
        navigate('/login');
      }
    } catch (e) {
      console.error('Error signing out: ', e);
    }
  }

  return (
    <div className="flex flex-col gap-10 items-center mb-10">
      <h1 className="text-lg">TASKS</h1>
      <button className="border-2 p-1 rounded-lg" onClick={signOut}>
        SIGN OUT
      </button>
      <div className="p-4 w-fit border-1">
        <DailyList />
      </div>

      <div className="p-4 w-fit border-1">
        <GoalList />
      </div>
    </div>
  );
}

export default Homepage;

//TODO: enforce dedup session create on backend -->

//TODO: create archive backend route and frontend page/link
//TODO: create daily refresh backend route
//TODO: set up daily cron service to use refresh route
