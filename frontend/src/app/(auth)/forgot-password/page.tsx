'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn!');
      return;
    }
    
    setIsLoading(true);
    
    // Mô phỏng API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau!');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 py-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex justify-center">
            <Image 
              src="/logo.svg" 
              alt="AllDrama Logo" 
              width={60} 
              height={60} 
              className="mx-auto"
            />
          </Link>
          <h2 className="mt-4 text-3xl font-extrabold text-white">Quên mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-400">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>
        
        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/60 text-white text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : 'Gửi liên kết đặt lại mật khẩu'}
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/login" className="font-medium text-red-500 hover:text-red-400">
                Quay lại trang đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="bg-green-900/60 text-white p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Yêu cầu đã được gửi!</h3>
              <p className="text-sm">
                Chúng tôi đã gửi email với hướng dẫn đặt lại mật khẩu tới {email}. 
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
              </p>
            </div>
            
            <div className="text-center">
              <Link href="/login" className="inline-flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Quay lại trang đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 