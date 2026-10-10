import DailyList from './DailyList';
import GoalList from './GoalList';

function Homepage() {
  return (
    <div className="flex flex-col gap-10 items-center mb-10">
      <h1 className="text-lg">TASKS</h1>
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
