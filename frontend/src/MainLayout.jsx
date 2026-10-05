import React, { useEffect, useState } from 'react'
import { NavLink, Outlet } from "react-router-dom"
import Header from "./components/Header"
import Footer from './components/Footer'
import axios from 'axios'
import bg from './script'

const MainLayout = () => {
    const API = "https://todoapp-backend-4yfx.onrender.com"

    const [todo, setTodo] = useState("")
    const [date, setDate] = useState(null)

    const [addMonthltTask, setAddMonthltTask] = useState(false)
    const [todos, setTodos] = useState([])

    const [enableDate, setEnableDate] = useState(false)

    const [bgImages, setBgImages] = useState(false)

    const [background, setBackground] = useState()

    const [loader, setLoader] = useState(true)


    const getTodos = () => {

        setLoader(true)

        setTimeout(()=>{
            axios
            .get(`${API}/todos`)
            .then(result => {
                setTodos(result.data.todos)

            })
            .catch(error => {
                console.log(error)
            })
            .finally(()=>{
                // setLoader(false)
            })
        },0)
            
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
        

        axios
            .post(`${API}/newTodo`, {
                todo,
                type: "monthly",
                specialDate: date || null
            })

            .then(result => {

                setTodo("")
                setDate(null)
                getTodos()

            })

            .catch(error => console.log(error))
    }

    const monthlyTodos = todos.filter(todo => todo.type === "monthly")

    return (
        <>
            <div className='mainLayout'>

                <Header />

                <div 
                    className='contents'
                    style={{backgroundImage:`url(${background}`}}
                >

                    <div className='todoList'>
                        <Outlet />
                    </div>

                    <div className='cards'
                        style={{position:'relative'}}
                    >

                        <div className='buttons'>

                            <NavLink to="/"
                                style={({ isActive }) => ({
                                    color: isActive ? "#99ff00" : "#ff7700",
                                })}
                            >
                                <i className='fas fa-arrow-left'></i>
                                <span>Back</span>
                            </NavLink>

                            <NavLink to="/todo-Pending"
                                style={({ isActive }) => ({
                                    color: isActive ? "#99ff00" : "#ff7700",
                                })}
                            >
                                <i className='fas fa-list'></i>
                                <span>Pending</span>
                            </NavLink>

                            <NavLink to="/todo-finished"
                                style={({ isActive }) => ({
                                    color: isActive ? "#99ff00" : "#ff7700",
                                })}
                            >
                                <i className='fas fa-list-check'></i>
                                <span>Old List</span>
                            </NavLink>
                                <i 
                                    className='fas fa-bars'
                                    onClick={()=>{
                                        bgImages === false ? setBgImages(true) : setBgImages(false)
                                    }}
                                ></i>


                        </div>

                        <div
                            
                        >

                            <p
                                style={{
                                    background: "#1d1d1d",
                                    width: "fit-content",
                                    padding: '5px',
                                    margin: '15px 0',
                                    borderRadius: '8px',
                                    boxShadow: '0 0 10px #000000'
                                    
                                }}
                            >Monthly Entry</p>

                            <div className='monthlyTask'>

                                {
                                    monthlyTodos.map((li, index) => {

                                        return (
                                            <div
                                                className={
                                                    
                                                    `${new Date(li.lastCompleted).getMonth() === new Date().getMonth() &&
                                                        new Date(li.lastCompleted).getFullYear() === new Date().getFullYear()
                                                        ? "monthlyTask-todo-done"
                                                        : "monthlyTask-todo-pending"
                                                    }`
                                                }
                                                key={index}
                                            >
                                                {li.todo}
                                            </div>
                                        )

                                    })
                                }

                                <form
                                    className='monthlyTaskInputForm'
                                    onSubmit={handleSubmit}
                                >

                                    {
                                        addMonthltTask && (

                                            <div className='monthlyTaskInput'>

                                                <input
                                                    type="text"
                                                    value={todo}
                                                    placeholder='TO DO'
                                                    onChange={(e) =>
                                                        setTodo(e.target.value)
                                                    }
                                                />
                                                {
                                                    enableDate && (
                                                        <input
                                                            type="date"
                                                            value={date}
                                                            onChange={(e) => setDate(e.target.value)}
                                                        />
                                                    )
                                                }
                                                
                                                <i
                                                className={`${!enableDate ? "fas fa-calendar" : "fas fa-calendar-xmark"}`}
                                                onClick={()=>{
                                                    enableDate !== true ? setEnableDate(true) : setEnableDate(false)
                                                }}
                                                title={`${!enableDate ? "Enable" : "Disable"}`}
                                                ></i>

                                            </div>

                                        )
                                    }

                                    <i
                                        className={
                                            !addMonthltTask
                                                ? "fas fa-plus"
                                                : "fas fa-close"
                                        }
                                        onClick={() =>
                                            setAddMonthltTask(!addMonthltTask)
                                        }
                                    ></i>

                                </form>

                            </div>

                        </div>

                        <div>card2</div>
                        <div>card3</div>
                        {bgImages && (               
                            <div className='bgContainer'
                                style={{backgroundImage:`url(${background})`}}
                            >
                                
                                
                                    {
                                    
                                        bg.map((img, index)=>{
                                            return(
                                                <img 
                                                src={img.image} 
                                                alt="bg"
                                                key={index}
                                                width={200}
                                                onClick={()=>{
                                                    setBackground(img.image)
                                                }}
                                                />
                                            )
                                        })
                                    
                                }
                               

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
                                style={{position:'absolute', top:'48%', color:'#fff',fontSize:'10px'}}
                            >loading</div>
                        </div>
                        )
                    }
                </div>

                <Footer />

            </div>
        </>
    )
}

export default MainLayout