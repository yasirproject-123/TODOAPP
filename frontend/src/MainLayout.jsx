import React, { useEffect, useState } from 'react'
import { NavLink, Outlet } from "react-router-dom"
import Header from "./components/Header"
import axios from 'axios'
import images from './script'

const MainLayout = () => {

    const API = "https://todoapp-backend-4yfx.onrender.com"

    const [loader, setLoader] = useState(true)

    const [todo, setTodo] = useState("")
    const [date, setDate] = useState("")

    const [addMonthltTask, setAddMonthltTask] = useState(false)
    const [todos, setTodos] = useState([])

    const [bg, setBg] = useState(()=>{
        const savedBg = localStorage.getItem('bg')
        return savedBg ? JSON.parse(savedBg) : ''
    })
    const [bgConatiner, setBgConatiner] = useState(false)


    const getTodos = () => {
        setLoader(true)
        
        axios
            .get(`${API}/todos`)
            .then(result => {
                setTodos(result.data.todos)
                // window.dispatchEvent(new Event('todoUpdated'))
                setLoader(false)
            })
            .catch(error => {
                console.log(error)
            })
            
    }

    useEffect(() => {

        getTodos()

        const handleTodoUpdated = () => {
            getTodos()
        }

        window.addEventListener('todoUpdated', handleTodoUpdated)

        return () => {
            window.removeEventListener('todoUpdated', handleTodoUpdated)
        }

        

    }, [])


    const handleSubmit = (e) => {

        e.preventDefault()
        console.log({ todo, type: "monthly", specialDate: date });

        axios
            .post(`${API}/newTodo`, {
                todo,
                type: "monthly",
                specialDate: date || null
            })

            .then(result => {

                setTodo("")
                setDate("")
                getTodos()

            })

            .catch(error => console.log(error))
    }

    const monthlyTodos = todos.filter(todo => todo.type === "monthly")

    const handleSetBg = (url) => {
        
        localStorage.setItem("bg", JSON.stringify(url))

        const bgImg = JSON.parse(localStorage.getItem('bg'))

        setBg(bgImg)

    }

    return (
      <div>
        <div className="mainLayout"
        style={{
            backgroundImage:`url(${bg})`,
            backgroundPosition:'center',
            backgroundRepeat:'no-repeat',
            backgroundSize:'cover'
          
          }}
        >
          <Header />

          <div className="contents" 
          
          >
            <div className="todoList">
              <Outlet />
            </div>

            <div className="cards">
              <div className="buttons">
                <NavLink
                  to="/"
                  style={({ isActive }) => ({
                    color: isActive ? "#99ff00" : "#ff7700",
                  })}
                >
                  <i className="fas fa-arrow-left"></i>
                  <span>Back</span>
                </NavLink>

                <NavLink
                  to="/todo-Pending"
                  style={({ isActive }) => ({
                    color: isActive ? "#99ff00" : "#ff7700",
                  })}
                >
                  <i className="fas fa-list"></i>
                  <span>Pending</span>
                </NavLink>

                <NavLink
                  to="/todo-finished"
                  style={({ isActive }) => ({
                    color: isActive ? "#99ff00" : "#ff7700",
                  })}
                >
                  <i className="fas fa-list-check"></i>
                  <span>Old List</span>
                </NavLink>

                <div
                  className={`fa-bars ${bgConatiner ? "active" : ""}`}
                  onClick={() => setBgConatiner(!bgConatiner)}
                >
                  <div className="bar bar1"></div>
                  <div className="bar bar2"></div>
                </div>

              </div>

              <div
                className='card'
              >
                <p
                  style={{
                    background: "transparent",
                    boxShadow:`
                      3px 3px 5px #050505a1,
                      inset 1px 3px 3px -3px #aaaaaa,
                      inset 0 -2px 5px -3px #acacac
                    `,
                    backdropFilter:`
                      blur(2px)
                      contrast(110%)
                    `,
                    width: "fit-content",
                    padding: "3px 10px",
                    margin: "15px 0",
                    borderRadius: "5px",
                    fontSize:'18px',
                    fontWeight:'600',
                    letterSpacing: "1px",
                    color:'#eeff00',
                    textDecoration:'underline',
                    border:'1px solid #0000002c',
                    marginLeft: "10px"
                  }}
                >
                  Monthly Task
                </p>

                <div className="monthlyTask">
                  {monthlyTodos.map((li, index) => {
                    return (
                      <div
                        className={`monthlyTaskTodo ${
                          new Date(li.lastCompleted).getMonth() ===
                            new Date().getMonth() &&
                          new Date(li.lastCompleted).getFullYear() ===
                            new Date().getFullYear()
                            ? "monthlyTask-todo-done"
                            : "monthlyTask-todo-pending"
                        }`}
                        key={index}
                      >
                        {li.todo}
                      </div>
                    );
                  })}

                  <form className="monthlyTaskInput" onSubmit={handleSubmit}>
                    {addMonthltTask && (
                      <div>
                        <input
                          type="text"
                          value={todo}
                          placeholder="Monthly Task"
                          required
                          onChange={(e) => setTodo(e.target.value)}
                        />

                        <input
                          type="date"
                          value={date}
                          required
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    )}

                    <i
                      className={
                        !addMonthltTask ? "fas fa-plus" : "fas fa-close"
                      }
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => setAddMonthltTask(!addMonthltTask)}
                    ></i>
                  </form>
                </div>
              </div>
              {bgConatiner && (
                <div className="bgContainer">
                  <div
                    onClick={() => {
                      localStorage.removeItem("bg")
                      setBg("");
                      setBgConatiner(false)
                    }}
                  >
                    <p>Default</p>
                  </div>
                  {images.map((url, index) => {
                    return (
                      <img
                        src={url.url}
                        alt={url.url}
                        key={index}
                        width={200}
                        onClick={() => {
                          handleSetBg(url.url)
                          setBgConatiner(false)
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
              {
                        loader && (
                        <div className='loader'>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div
                                style={{color:'#fff', fontSize:'10px'}}
                            >loading</div>
                        </div>
                        )
              }

          </div>
        </div>
      </div>
    );
}

export default MainLayout
