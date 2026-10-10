import React from 'react'
import Login from './Login'
import Register from './Register'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

const Home = () => {
  return (
    <>  
        <div className='header'>
          <h4>TODO APP</h4>
        </div>
        
        <div className='mainLayout'>
          <Outlet />
        </div>
    </>
  )
}

export default Home