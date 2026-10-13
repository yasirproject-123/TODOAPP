
import React, { useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const ForgetPassword = () => {

    const API = "https://todoapp-backend-4yfx.onrender.com"
  // const API = "http://localhost:3000"

  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      // STEP 1: Request password reset
      if (!resetToken) {
        const res = await axios.post(
          `${API}/send-reset-link`,
          { email },
          { withCredentials: true }
        )

        setMsg(res.data.message)
        return
      }

      // STEP 2: Reset password using the token
      if (newPassword !== confirmPassword) {
        setMsg('Passwords do not match')
        return
      }

      const res = await axios.post(
        `${API}/forgot-password`,
        {
          newPassword,
          confirmPassword,
          resetToken,
        },
        { withCredentials: true }
      )

      setMsg(res.data.message)

      setNewPassword('')
      setConfirmPassword('')

    } catch (error) {
      setMsg(
        error.response?.data?.message ||
        'Something went wrong.'
      )
      console.log(resetToken);
      
      
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <form onSubmit={handleSubmit}>
        <div className="header">
          <h5>{resetToken ? 'Reset Password' : 'Forgot Password'}</h5>
          <p style={{display:'visible'}}>{msg}</p>
        </div>

        <div className="loginInput">
          {!resetToken ? (
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '8px',
            }}
          >
            <button type="submit" disabled={loading}>
              {loading
                ? 'Please wait...'
                : resetToken
                  ? 'Save'
                  : 'Send Link'}
            </button>

              <button type="button">
            <NavLink to="/home/login">
                Return To Login
            </NavLink>
              </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ForgetPassword
