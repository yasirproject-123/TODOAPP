import React, { useState } from 'react'
import axios from 'axios'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const API = "https://todoapp-backend-4yfx.onrender.com"
  // const API = "http://localhost:3000"

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit =(e)=> {
    e.preventDefault()

    axios
      .post(`${API}/login`,
        {email, password}, 
        {withCredentials:true}
      )

      .then((result)=>{
        console.log(result.data.message);
        localStorage.setItem("token", JSON.stringify(result.data.token))
        navigate("/")
      })

      .catch((error)=>{
        console.log(error.response?.data?.message || error.message);
      })
  }

  return (
    <div className='home'>
      <form 
        onSubmit={handleSubmit}
      >
        <h5>Login</h5>

        <div className='loginInput'>

        <input 
          type="text" 
          required
          placeholder='Email'
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          />
        <input 
          type="password" 
          value={password}
          required
          placeholder='Password'
          onChange={(e)=>setPassword(e.target.value)}
          />

          <div 
          style={{
            display:'flex', 
            flexDirection:'row', 
            gap:'8px',
            }}>
            <button type='submit'>Login</button>

            <button type='button'>
              <NavLink to={"/home/register"}>Register</NavLink>
            </button>
          </div>

          </div>
      </form>

      
      
    </div>
  )
}

export default Login