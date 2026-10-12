
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'

const ResetPassword = () => {

    const API = "https://todoapp-backend-4yfx.onrender.com"
  // const API = "http://localhost:3000"

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [msgBox, setMsgBox] = useState(false)
    const [msg, setMsg] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (newPassword !== confirmNewPassword) {
            setMsgBox(true)
            setMsg("No Matching !")
            return
        }

        axios
            .post(`${API}/reset-password`,
                {oldPassword, newPassword, confirmNewPassword},
                {withCredentials:true}
            )
            .then((result)=>{
                setMsg(result.data.message)
            })
            .catch((error)=>{})

    }


    return (
        <div className='home'>
            <form onSubmit={handleSubmit}>
                <div className='header'>
                    <h5>Reset Password</h5>

                    {msgBox && (
                        <p className={msg === "Matching" ? "match" : ""}>
                            {msg}
                        </p>
                    )}
                </div>

                <div className='loginInput'>
                    <input
                        type="password"
                        required
                        placeholder='Old Password'
                        value={oldPassword}
                        onChange={(e) => {
                            setOldPassword(e.target.value)
                            e.target.value === "" ? setMsgBox(false) : ""
                        }}
                    />

                    <input
                        type="password"
                        required
                        placeholder='New Password'
                        value={newPassword}
                        onChange={(e) => {
                            const value = e.target.value
                            setNewPassword(value)
                        }}
                    />

                    <input
                        type="password"
                        required
                        placeholder='Confirm New Password'
                        value={confirmNewPassword}
                        onChange={(e) =>{
                            setConfirmNewPassword(e.target.value)
                            setMsg(e.target.value === newPassword ? "Matching": "No Matching !")
                        }}
                    />

                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '8px'
                    }}>
                        <button type='submit'>Save</button>

                        <button type='button'>
                            <NavLink to={""}>Forget Password</NavLink>
                        </button>
                    </div>

                    <NavLink
                        className="reset-link"
                        to={"/home/login"}
                    >
                        Return To Login
                    </NavLink>
                </div>
            </form>
        </div>
    )
}

export default ResetPassword
