import React, { useEffect, useState } from 'react'
import axios from 'axios'

const TotoPending = () => {
  const API = "https://todoapp-backend-4yfx.onrender.com"
    
    const [todos, setTodos] = useState([])

    const today = new Date()

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

    const deleteTodo = (id) => {
        axios
            .delete(`${API}/deleteTodo/${id}`)
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


    const pendinTodos = todos.filter(todo => todo.status === "pending")
    // const filteredTodos = todoPending.filter((todo) => {
    //     const dueDate = new Date(todo.specialDate);

    //     const daysLeft = Math.ceil(
    //         (dueDate - today) / (1000 * 60 * 60 * 24)
    //     );

    //     return daysLeft <= 0 && todo.status === 'pending';
    // });

    return (
        <div>
            <div className='input'>
                <h3>All Up Pending To Do list</h3>
            </div>

            <div className='todo-list-wrapper'>
                {
                    pendinTodos.length > 0 ? (
                        pendinTodos.map((todo, index) => {
                            return <div key={index} className='todo-wrapper'>
                                <div className='todo'>
                                    <div>{todo.todo}</div>
                                    <p>{`Coming On : ${todo.specialDate}`}</p>
                                </div>
                                <div>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                    >
                                        <i className='fas fa-trash'></i>
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        })
                    ) : (
                        <div>No Pending Data Found</div>

                    )
                }

            </div>
            
        </div>
    )
}

export default TotoPending