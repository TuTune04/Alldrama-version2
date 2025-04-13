'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <img
              className="mx-auto h-16 w-auto"
              src="logo.png"
              alt="Alldrama"
            />
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-200">
              Sign in to access your admin dashboard
            </p>
          </div>

          <div className="mt-8">
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-lg">
              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 p-4 backdrop-blur-sm">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiMail className="h-5 w-5 text-gray-300" />
                    </div>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      placeholder="Email address"
                      className="block w-full appearance-none rounded-lg border border-transparent bg-white/5 pl-10 pr-3 py-2 text-white placeholder-gray-300 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-200">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiLock className="h-5 w-5 text-gray-300" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      placeholder="Password"
                      className="block w-full appearance-none rounded-lg border border-transparent bg-white/5 pl-10 pr-10 py-2 text-white placeholder-gray-300 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-300" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-300" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-200">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('remember')}
                      className="h-4 w-4 rounded border-gray-300 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-200">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-gray-200 hover:text-white">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex w-full justify-center rounded-lg border border-transparent bg-white py-2 px-4 text-sm font-medium text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <svg className="h-5 w-5 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}