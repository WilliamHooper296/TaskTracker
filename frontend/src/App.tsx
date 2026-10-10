import './App.css';
import DailyList from './pages/DailyList';
import GoalList from './pages/GoalList';

function App() {
  return (
    <div className='flex flex-col gap-10 items-center mb-10'>
      <h1 className='text-lg'>TASKS</h1>
      <div className='p-4 w-fit border-1'><DailyList /></div>
      
      <div className='p-4 w-fit border-1'><GoalList /></div>
    </div>
  )
  
}

export default App;

//ADD QUERIES AND ENDPOINT TO GENERATE NEW DAILY TASKS
//ADD CRON TO HANDLE IT AS WELL
//ADD LOGIN/SIGNUP
//ADD JWT AND ENCRYPTION