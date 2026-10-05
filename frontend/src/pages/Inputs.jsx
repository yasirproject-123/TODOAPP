import React, { useEffect, useState } from 'react'
import axios from 'axios'



const Inputs = ({ onTodoAdded }) => {

  const API = "https://todoapp-backend-4yfx.onrender.com"

  const [todo, setTodo] = useState("")
  const today = new Date() 
  const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [date, setDate] = useState(currentDate)

  const handleSubmit = (e) => {
    e.preventDefault()
    // console.log({ todo, type: "daily", specialDate: date });
    // setDate(currentDate)

    axios
      .post(`${API}/newTodo`, { todo, type: "daily", specialDate: date || null })

      .then(result => {
        // alert(result.data.message)
        setTodo("")
        setDate(currentDate)
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
          placeholder='Day to Day Task'
          onChange={(e) => setTodo(e.target.value)}
        />

        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />


        <button type='submit'>Add</button>
      </div>
    </form>
  )
}

export default Inputs
