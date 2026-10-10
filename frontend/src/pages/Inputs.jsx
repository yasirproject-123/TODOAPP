import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



const Inputs = ({ onTodoAdded }) => {

  const API = "https://todoapp-backend-4yfx.onrender.com"
  // const API = "http://localhost:3000"

  const [todo, setTodo] = useState("")
  const today = new Date() 
  const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [date, setDate] = useState(currentDate)

  const navigate = useNavigate()

  const handleSubmit = (e) => {

    e.preventDefault()
    

    const token = localStorage.getItem('token')
    
    if (!token) {
      navigate("/home")
      return
    }
    // console.log({ todo, type: "daily", specialDate: date });
    // setDate(currentDate)

    axios
      .post(`${API}/newTodo`, 
        { todo, type: "daily", specialDate: date},
        {withCredentials:true}
      )

      .then(result => {
        // alert(result.data.message)
        setTodo("")
        setDate(currentDate)
        onTodoAdded()
      })
      .catch(error => console.log(error))

  }

  return (
    <form onSubmit={handleSubmit} className='dailyForm'>

      <div className='input'>
        <input
          type="text"
          required
          value={todo}
          placeholder='Day to Day Task'
          onChange={(e) => setTodo(e.target.value)}
        />

        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
        <button type='submit'>Add</button>
    </form>
  )
}

export default Inputs
