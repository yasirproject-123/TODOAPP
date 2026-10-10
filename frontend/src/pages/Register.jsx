import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Register = () => {

  const API = "https://todoapp-backend-4yfx.onrender.com"
  // const API = "http://localhost:3000"

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit =(e)=> {
    e.preventDefault()

    axios
      .post(`${API}/new-user`,{email, password})
      .then((result)=>{
        console.log(result.data.message)

        navigate("/home/login")
      })
      .catch((error)=>{
        console.log(error.response?.data?.message);
      })
  }

  return (
    <div className='home'>
          <form onSubmit={handleSubmit}>
        <h5>Register</h5>

        <div className='loginInput'>

          <input 
            type="email" 
            value={email}
            required
            placeholder='Email'
            onChange={(e)=>setEmail(e.target.value)}
            />
        <input 
          type="password" 
          required
          placeholder='Password'
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          />

          <div 
          style={{
            display:'flex', 
            flexDirection:'row', 
            gap:'8px',
            }}>
            <button type='submit'>Register</button>

            <button type='button'>
              <NavLink to={"/home/login"}>Login</NavLink>
            </button>
          </div>

          </div>
          </form>
  
          
        </div>
  )
}

export default Register