import { useState } from 'react';

function Signup() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="flex flex-col items-center justify-center mt-10 gap-10">
      <h1>SIGN UP</h1>
      <div className="flex flex-col border-2 w-fit p-6 pb-10 bg-emerald-100 rounded-2xl">
        <div className="flex flex-col items-start">
          <label className="text-emerald-400">Username</label>
          <input
            className="border-1 border-lightgrey-300 text-emerald-400"
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            name="Username"
          ></input>
        </div>
        <div className="flex flex-col items-start">
          <label className="text-emerald-400">Password</label>
          <input
            className="border-1 border-lightgrey-300 text-emerald-400"
            type="text"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            name="Password"
          ></input>
        </div>
      </div>
      <div className="flex border-2 w-fit p-6 bg-emerald-100 gap-10 rounded-2xl">
        <button className="border-2 bg-emerald-200 p-2 rounded-2xl hover:bg-emerald-600">
          LOGIN
        </button>
        <button className="border-2 bg-emerald-200 p-2 rounded-2xl hover:bg-emerald-600">
          LOGIN
        </button>
      </div>
    </div>
  );
}

export default Signup;
