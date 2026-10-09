import './App.css';
import DailyList from './pages/DailyList';
import GoalList from './pages/GoalList';

function App() {
  return (
    <div className='flex flex-col gap-10 items-center'>
      <h1 className='text-lg'>TASKS</h1>
      <div className='p-4 w-fit border-1'><DailyList /></div>
      
      <div className='p-4 w-fit border-1'><GoalList /></div>
    </div>
  )
  
}

export default App;

//main page with daily checklist and overarching reminders
//sidebar of separate lists
//options to create those other lists
//within list, maybe checklist maybe just reminders, both have options to remove items or create
//main page has options to add to overarching or daily, as well as track historical daily
