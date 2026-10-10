import { useEffect, useState } from 'react';
import trash from '../assets/trash.svg';

type Goal = {
  contents: string;
  checked: boolean;
  goal_id: number;
};

const USER_ID = '1';

const API_URL = import.meta.env.VITE_BACKEND_URL;

async function fetchGoals(): Promise<Goal[]> {
  const response = await fetch(`${API_URL}/lists/goals`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      user_id: USER_ID,
    },
  }).then((res) => res.json());
  return response.list.sort((a: Goal, b: Goal) =>
    a.contents.localeCompare(b.contents),
  );
}

function GoalList() {
  const [GoalNameInput, setGoalNameInput] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    fetchGoals().then((res) => setGoals(res));
  }, []);

  async function handleAddTask() {
    if (!GoalNameInput.trim()) return;

    await fetch(`${API_URL}/add/goal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        user_id: USER_ID,
      },
      body: JSON.stringify({
        name: GoalNameInput,
      }),
    });
    setGoals(await fetchGoals());
    setGoalNameInput('');
  }

  async function handleToggleDaily(goal_id: number) {
    await fetch(`${API_URL}/swap/goals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        user_id: USER_ID,
      },
      body: JSON.stringify({ goal_id: goal_id }),
    });
    setGoals(await fetchGoals());
  }

  async function handleRemoveTask(goal_id: number) {
    await fetch(`${API_URL}/lists/goals`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        user_id: USER_ID,
      },
      body: JSON.stringify({ goal_id: goal_id }),
    });
    setGoals(await fetchGoals());
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 ">
        {goals.map((task) => (
          <div key={task.goal_id} className="contents">
            <div
              className={`${task.checked ? 'line-through decoration-double' : ''}`}
            >
              {task.contents}
            </div>
            <input
              type="checkbox"
              checked={task.checked}
              onChange={() => handleToggleDaily(task.goal_id)}
            ></input>
            <button
              onClick={() => handleRemoveTask(task.goal_id)}
              className="border-2 rounded-full bg-red-600"
            >
              <img src={trash} width="20px" height="20px" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        <input
          type="text"
          value={GoalNameInput}
          onChange={(e) => setGoalNameInput(e.target.value)}
          className="border-2"
        />

        <button onClick={handleAddTask} className="min-w-20 border-2">
          Add
        </button>
      </div>
    </div>
  );
}

export default GoalList;
