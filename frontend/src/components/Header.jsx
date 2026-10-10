import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'


const Header = () => {

  const API = "https://todoapp-backend-4yfx.onrender.com"

  const [todoPending, setTodoPending] = useState([])
  const [shutter, setShutter] = useState(false)
  const navigate = useNavigate()

  const getTodos = () => {
    axios
      .get(`${API}/todos/today`,{withCredentials:true})
      .then(result => {
        setTodoPending(result.data.todos)

      })
      .catch(error => {
        console.log(error)
        setLoading(false)
      })
  }

  useEffect(() => {
    getTodos()

    window.addEventListener('todoUpdated', getTodos)

    return () => {
      window.removeEventListener('todoUpdated', getTodos)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API}/logout`,
        {},
        { withCredentials: true }
      );

      localStorage.removeItem('token');
      navigate("/home")
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // const currentDateTodo = todoPending.filter(
  //   todo => todo.specialDate <= date && todo.status === "pending"
  // )


  return (
    <div className='header'>
      <h4>TODO APP</h4>

      <div className='bell'>
        <p>{todoPending.length <= 0 ? "Up to Dated" : `Date Due Items Found ( ${todoPending.length} )`}</p>
        <NavLink to='/'>
          <i
            className={`fas fa-bell ${todoPending.length > 0 ? 'fa-shake' : ''
              }`}
          ></i>
        </NavLink>
      </div>

              <div className={`shutter ${shutter ? 'active' : ''}`}>
                <button
                  onClick={handleLogout}
                >Log Out</button>
                <i 
                className={`fas fa-chevron-${!shutter?'down':'up'}`}
                onClick={()=>{
                  !shutter ? setShutter(true) : setShutter(false)
                }}
                ></i>
              </div>

    </div>
  )
}

export default Header
