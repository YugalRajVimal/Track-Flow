import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  RiMailLine,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiShip2Line,
  RiLoader4Line
} from 'react-icons/ri'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'

// Orange theme color
const orange = '#f58021'

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.login(data)
      if (res.data?.success) {
        const { token, user } = res.data.data
        login(token, user)
        toast.success(`Welcome back, ${user.name}!`)
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white relative overflow-hidden">
      {/* No color/pattern background, only white */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-32 w-32 rounded-2xl"
          >
            {/* Logo image next to icon */}
            <div className="flex items-center justify-center ">

              <img src="/logo.png" alt="Logo" className="h-32 w-32 object-contain" />
            </div>
       
          </div>
          {/* <h1 className="text-3xl font-bold text-black tracking-tight">Ammiy London</h1> */}
          <p className="text-gray-500 text-sm">Enterprise AWB Barcode Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-black">Sign in to your account</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Email Address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: orange }} />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 pl-9 py-2 text-black shadow-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: orange }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 pl-9 pr-10 py-2 text-black shadow-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd
                    ? <RiEyeOffLine style={{ color: orange }} />
                    : <RiEyeLine style={{ color: orange }} />
                  }
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center transition-colors font-semibold w-full py-3 mt-2 text-base rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: orange,
                color: "#fff"
              }}
            >
              {loading ? (
                <>
                  <RiLoader4Line className="animate-spin mr-2" style={{ color: "#fff" }} /> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Protected by enterprise-grade security
        </p>
      </motion.div>
    </div>
  )
}
