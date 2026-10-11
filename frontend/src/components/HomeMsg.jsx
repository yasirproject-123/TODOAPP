import React from 'react'
import { NavLink } from 'react-router-dom'
import Digital from '../assets/bg/Videos/Digital.mp4'

const HomeMsg = () => {
  return (
    <div className='home'>
      <video
        className="home-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={Digital} type="video/mp4" />
      </video>

      <div className='home-content'>
        <h1>My Todo App</h1>
        <p>Organize your daily tasks.</p>
        <NavLink to={"/home/login"}>Login</NavLink>
      </div>
      
    </div>
  )
}

export default HomeMsg