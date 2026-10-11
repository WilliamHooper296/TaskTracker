import { useEffect, useState } from 'react';
import trash from '../assets/trash.svg';
import { useNavigate } from 'react-router-dom';

type Daily = {
  contents: string;
  checked: boolean;
  daily_id: number;
  completion: string;
};

const API_URL = import.meta.env.VITE_BACKEND_URL;

function DailyList() {
  const navigate = useNavigate();
  const [DailyNameInput, setDailyNameInput] = useState('');
  const [DailyTimeInput, setDailyTimeInput] = useState('');
  const [daily, setDaily] = useState<Daily[]>([]);

  useEffect(() => {
    fetchDaily().then((res) => setDaily(res));
  }, []);

  async function fetchDaily(): Promise<Daily[]> {
    const response = await fetch(`${API_URL}/lists/daily`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }).then((res) => res.json());

    if (response.status == 401) {
      navigate('/login');
    }

    return response.list.sort((a: Daily, b: Daily) =>
      a.completion.localeCompare(b.completion),
    );
  }

  async function handleAddTask() {
    if (!DailyNameInput.trim()) return;

    const response = await fetch(`${API_URL}/add/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: DailyNameInput,
        complete: DailyTimeInput,
      }),
      credentials: 'include',
    });

    if (response.status == 401) {
      navigate('/login');
    }

    setDaily(await fetchDaily());
    setDailyNameInput('');
  }

  async function handleToggleDaily(daily_id: number) {
    const response = await fetch(`${API_URL}/swap/daily`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ daily_id: daily_id }),
      credentials: 'include',
    });

    if (response.status == 401) {
      navigate('/login');
    }

    setDaily(await fetchDaily());
  }

  async function handleRemoveTask(daily_id: number) {
    const response = await fetch(`${API_URL}/lists/daily`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ daily_id: daily_id }),
      credentials: 'include',
    });

    if (response.status == 401) {
      navigate('/login');
    }

    setDaily(await fetchDaily());
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 ">
        {daily.map((task) => (
          <div key={task.daily_id} className="contents">
            <div
              className={`${task.checked ? 'line-through decoration-double' : ''}`}
            >
              {task.contents}
            </div>
            <input
              type="checkbox"
              checked={task.checked}
              onChange={() => handleToggleDaily(task.daily_id)}
            ></input>
            <div>{task.completion.substring(0, 5)}</div>
            <button
              onClick={() => handleRemoveTask(task.daily_id)}
              className="border-2 rounded-full bg-red-600 hover:bg-red-900"
            >
              <img src={trash} width="20px" height="20px" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        <input
          type="text"
          value={DailyNameInput}
          onChange={(e) => setDailyNameInput(e.target.value)}
          className="border-2"
        />
        <input
          type="time"
          step="900"
          value={DailyTimeInput}
          onChange={(e) => setDailyTimeInput(e.target.value)}
          className="border-2"
        />

        <button onClick={handleAddTask} className="min-w-20 border-2">
          Add
        </button>
      </div>
    </div>
  );
}

export default DailyList;
