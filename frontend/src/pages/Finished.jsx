import React, { useEffect, useState } from 'react'
import axios from 'axios'


const Finished = () => {

  const API = "https://todoapp-backend-4yfx.onrender.com"

  const [todos, setTodos] = useState([])
  const [searchWord, setSearchWord] = useState('')


  const getTodos = () => {
    axios
      .get(`${API}/todos`)
      .then(result => {
        setTodos(result.data.todos)
        window.dispatchEvent(new Event('todoUpdated'))

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
        
      })
      .catch(error => {
        console.log(error)
      })

  }

  useEffect(() => {
    getTodos()
  }, [])

  const finishedTodos = todos.filter(todo => todo.status === "done" || todo.lastCompleted !== null)
  const search = finishedTodos.filter(todo => todo.todo.toLowerCase().includes(searchWord.toLocaleLowerCase()))

  return (
    <div>
      <div className='dailyForm'>
        <div className='input'>

          <h3>Completed</h3>
          <input 
            type="search" 
            placeholder='Search'
            value={searchWord}
            onChange={(e)=>setSearchWord(e.target.value)}
            />
            </div>
      </div>
      <div className='todo-list-wrapper'>
        {
          search.map((todo, index) => {
            return <div key={index} className='todo-wrapper'>
              <div className='todo'>
                <div>{todo.todo}</div>
                <p>{
                  todo.lastCompleted === null
                    ? `Last Update : ${todo.specialDate}`
                    : `Last Update : ${todo.lastCompleted || "Not completed"}`
                }</p>
              </div>
              <div>
                <button
                  onClick={() => retreiveTodo(todo.id)}
                >
                  <i className='fas fa-arrow-left'></i>
                  <span>
                    Restore
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
