import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiShip2Line, RiLoader4Line } from 'react-icons/ri'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 bg-gradient-to-tr from-blue-50 via-white to-pink-50 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 shadow-glow-md mb-4">
            <RiShip2Line className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ammiy London</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Enterprise AWB Barcode Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white bg-opacity-80 rounded-xl shadow-lg p-8 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Sign in to your account</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 pl-9 py-2 text-gray-900 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 pl-9 pr-10 py-2 text-gray-900 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-700 transition-colors"
                >
                  {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 transition-colors text-white font-semibold w-full py-3 mt-2 text-base rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <><RiLoader4Line className="animate-spin mr-2" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Protected by enterprise-grade security
        </p>
      </motion.div>
    </div>
  )
}
