import React, { useEffect, useState } from 'react'
import Inputs from './Inputs'
import axios from 'axios'

const Pending = () => {

  const API = "https://todoapp-backend-4yfx.onrender.com"

  const [todoPending, setTodoPending] = useState([])

  const today = Date.now()


  const getTodos = () => {
    
    axios
      .get(`${API}/todos/today`)
      .then(result => {
        setTodoPending(result.data.todos)
        window.dispatchEvent(new Event('todoUpdated'))
      })
      .catch(error => {
        console.log(error)
      })
  }


  const finishTodos = (id) => {

    axios
      .put(`${API}/todos/${id}/complete`)
      .then(result => {
        getTodos()
      })
      .catch(error => {
        console.log(error)
      })

  }


  useEffect(() => {
    getTodos()
  }, [])


  // const filteredTodos = todoPending.filter((todo) => {
  //   const dueDate = new Date(todo.specialDate);

  //   const daysLeft = Math.ceil(
  //     (dueDate - today) / (1000 * 60 * 60 * 24)
  //   );

  //   return daysLeft <= 0 && todo.status === 'pending';
  // });

  return (
    <div>
      <Inputs onTodoAdded={getTodos} />

      <div className='todo-list-wrapper'>
        {
          todoPending.length > 0 ? (
            todoPending.map((todo, index) => {
              return <div key={index} className='todo-wrapper'>
                <div className='todo'>{todo.todo}</div>
                <div>
                  <button
                    onClick={() => finishTodos(todo.id)}
                  >
                    <i className='fas fa-arrow-right'></i>
                    <span>Finish</span>
                  </button>
                </div>
              </div>
            })
          ) : (
            <div>No data has to be passed today</div>
          )
        }

      </div>
    </div>
  )

}

export default Pending
