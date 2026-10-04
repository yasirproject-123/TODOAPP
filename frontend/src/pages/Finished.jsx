import React, { useEffect, useState } from 'react'
import axios from 'axios'


const Finished = () => {
  const API = "https://todoapp-backend-4yfx.onrender.com"
  const [todos, setTodos] = useState([])

  const getTodos = () => {
      axios
        .get(`${API}/todos`)
        .then(result => {
          setTodos(result.data.todos)
          console.log(result.data.todos);
          
        })
        .catch(error => {
          console.log(error)
        })
  }

  const retreiveTodo = (id) => {
    axios
      .put(`${API}/retreive-todo/${id}`)
      .then(result => {
        // alert(result.data.message)
        getTodos()
        window.dispatchEvent(new Event('todoUpdated'))
      })
      .catch(error => {
        console.log(error)
      })

  }
  
    useEffect(() => {
      getTodos()
    }, [])

    const finishedTodos = todos.filter(todo => todo.status === "done" || todo.lastCompleted !== null)
  
  return (
    <div>
      <div className='input'>
        <h3>Finished To Do list</h3>
      </div>
        <div className='todo-list-wrapper'>
          {
            finishedTodos.map((todo, index) => {
              return <div key={index} className='todo-wrapper'>
                <div className='todo'>
                  <div>{todo.todo}</div>
                  <p style={{color:"#c1c1c12f"}}>{
                  `Last Update : ${todo.lastCompleted}`
                  }</p>
                </div>
                <div>
                  <button
                    onClick={() => retreiveTodo(todo.id)}
                  >
                    <i className='fas fa-arrow-left'></i>
                    <span>
                      Retreive
                    </span>
                  </button>
                </div>
              </div>
            })
          }

        </div>

    </div>
  )
}

export default Finished