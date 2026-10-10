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
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          required
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />
        <input 
          type="password" 
          value={password}
          required
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button type='submit'>Login</button>
      </form>

      <NavLink to={"/home/register"}>Register</NavLink>
      
    </div>
  )
}

export default Login