import React from 'react'
import { NavLink } from 'react-router-dom'

const HomeMsg = () => {
  return (
    <div className='home'>
      <p>Welcome back</p>
      <NavLink to={"/home/login"}>Login</NavLink>
    </div>
  )
}

export default HomeMsg