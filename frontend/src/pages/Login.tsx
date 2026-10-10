import { useState } from 'react';

function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className='flex flex-col items-center justify-center mt-10 gap-10'>
        <h1>LOGIN</h1>
        <div className='flex flex-col border-2 w-fit p-6 pb-10'>
            <div className='flex flex-col items-start'>
                <label>Username</label>
                <input className='border-1 border-lightgrey-300' type='text' value={user} onChange={(e) => setUser(e.target.value)} name='Username'></input>
            </div>
            <div className='flex flex-col items-start'>
                <label>Password</label>
                <input className='border-1 border-lightgrey-300' type='text' value={pass} onChange={(e) => setPass(e.target.value)} name='Password'></input>
            </div>
        </div>

    </div>
  )

}

export default Login