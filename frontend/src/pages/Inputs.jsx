import React, { useEffect, useState } from 'react'
import axios from 'axios'



const Inputs = ({ onTodoAdded }) => {
  const API = "https://todoapp-backend-4yfx.onrender.com"

  const [todo, setTodo] = useState("")
  const [date, setDate] = useState(null)
  const type = "daily"

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({todo,type:"daily",specialDate:date});
    
    axios
      .post(`${API}/newTodo`, {todo, type:"daily", specialDate:date || null})

      .then(result => {
        alert(result.data.message)
        setTodo("")
        setDate(null)
        onTodoAdded()
      })
      .catch(error => console.log(error))
    
  }

  return (
    <form onSubmit={handleSubmit}>

      <div className='input'>
        <input
          type="text"
          required
          value={todo}
          onChange={(e)=>setTodo(e.target.value)}
          />
        
        <input 
        type="date" 
        required
        value={date}
        onChange={(e)=>setDate(e.target.value)}
        />


        <button type='submit'>Add</button>
      </div>
    </form>
  )
}

export default Inputs