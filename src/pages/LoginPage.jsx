import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiShip2Line, RiLoader4Line } from 'react-icons/ri'
import { authAPI } from '../api/auth'
import { useAuthStore } from '../store/authStore'

// Orange & White theme tokens
const ORANGE = '#f58021'
const textBrand = 'text-[#f58021]'
const textBrandSubtle = 'text-orange-400'
const textDark = 'text-slate-800'
const borderLight = 'border-orange-200'
const bgHighlight = 'bg-[#f58021]/10'
const bgWhite = 'bg-white'
const accent = 'text-[#f58021]'
const btnBrand = 'bg-[#f58021] hover:bg-[#f58021]/90 text-white'
const inputFocus = 'focus:border-[#f58021] focus:ring-1 focus:ring-[#f58021]'

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pale orange themed background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96" style={{ background: ORANGE, opacity: 0.08, borderRadius: '9999px', filter: 'blur(70px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80" style={{ background: ORANGE, opacity: 0.12, borderRadius: '9999px', filter: 'blur(80px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-glow-md mb-4"
            style={{ background: ORANGE }}
          >
            <RiShip2Line className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: ORANGE }}>Ammiy London</h1>
          <p className="text-orange-400 mt-1.5 text-sm">Enterprise AWB Barcode Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-8 border border-orange-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold" style={{ color: ORANGE }}>Sign in to your account</h2>
            <p className="text-orange-400 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textDark}`}>Email Address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                  })}
                  className={`block w-full rounded-lg border ${borderLight} bg-white px-4 pl-9 py-2 text-gray-900 shadow-sm focus:outline-none ${inputFocus} transition`}
                  placeholder="admin@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${textDark}`}>Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`block w-full rounded-lg border ${borderLight} bg-white px-4 pl-9 pr-10 py-2 text-gray-900 shadow-sm focus:outline-none ${inputFocus} transition`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 hover:text-[#f58021] transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className={`inline-flex items-center justify-center ${btnBrand} transition-colors font-semibold w-full py-3 mt-2 text-base rounded-lg shadow disabled:opacity-60 disabled:cursor-not-allowed`}>
              {loading ? (
                <><RiLoader4Line className="animate-spin mr-2" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-orange-400 mt-6">
          Protected by enterprise-grade security
        </p>
      </motion.div>
    </div>
  )
}
