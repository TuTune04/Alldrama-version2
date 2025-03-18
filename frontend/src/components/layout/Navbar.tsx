'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Xử lý sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Đóng menu user khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#user-menu') && isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Mock đã đăng nhập
  const isLoggedIn = true;

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-sm shadow-lg py-2' 
          : 'bg-gradient-to-b from-black/80 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 relative mr-2">
                <Image 
                  src="/logo.svg" 
                  alt="AllDrama Logo" 
                  width={40} 
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
                AllDrama
              </span>
            </Link>
            <div className="hidden md:block ml-6">
              <div className="flex items-center space-x-1">
                <Link 
                  href="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname === '/' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Trang chủ
                </Link>
                <Link 
                  href="/movie"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname.startsWith('/movie') && !pathname.startsWith('/movie/genre')
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  Phim
                </Link>
                <div className="group relative">
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                      pathname.startsWith('/movie/genre') 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    Thể loại
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-1 w-48 bg-gray-900 rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left">
                    <div className="p-2 grid grid-cols-2 gap-1">
                      <Link href="/movie/genre/hanh-dong" className="text-sm text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
                        Hành động
                      </Link>
                      <Link href="/movie/genre/tinh-cam" className="text-sm text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
                        Tình cảm
                      </Link>
                      <Link href="/movie/genre/hai-huoc" className="text-sm text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
                        Hài hước
                      </Link>
                      <Link href="/movie/genre/vien-tuong" className="text-sm text-gray-300 hover:bg-gray-800 hover:text-white px-3 py-2 rounded-md">
                        Viễn tưởng
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearchSubmit} className="relative mr-4">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                className="w-64 bg-gray-800 rounded-full py-2 pl-4 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            <div className="flex items-center space-x-2">
              {isLoggedIn ? (
                <div className="relative" id="user-menu">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      A
                    </div>
                    <svg 
                      className={`ml-1 h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg overflow-hidden z-10">
                      <div className="py-1">
                        <Link 
                          href="/profile" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          Trang cá nhân
                        </Link>
                        <Link 
                          href="/profile?tab=favorites" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          Phim yêu thích
                        </Link>
                        <Link 
                          href="/profile?tab=history" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          Lịch sử xem
                        </Link>
                        <Link 
                          href="/profile?tab=settings" 
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          Cài đặt
                        </Link>
                        <div className="border-t border-gray-800 my-1"></div>
                        <Link 
                          href="/logout" 
                          className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-800"
                        >
                          Đăng xuất
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    href="/register"
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative mr-2">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-36 bg-gray-800 rounded-full py-1.5 pl-3 pr-8 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-2 text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            {isLoggedIn && (
              <Link href="/profile" className="mr-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
              </Link>
            )}
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Mở menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden pt-2 pb-3 border-t border-gray-700" id="mobile-menu">
          <div className="px-2 space-y-1">
            <Link 
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/' ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Trang chủ
            </Link>
            <Link 
              href="/movie"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname.startsWith('/movie') ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Phim
            </Link>
            <div className="px-3 py-2 text-base font-medium text-gray-300">
              Thể loại
            </div>
            <div className="pl-6 grid grid-cols-2 gap-1">
              <Link href="/movie/genre/hanh-dong" className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                Hành động
              </Link>
              <Link href="/movie/genre/tinh-cam" className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                Tình cảm
              </Link>
              <Link href="/movie/genre/hai-huoc" className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                Hài hước
              </Link>
              <Link href="/movie/genre/vien-tuong" className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                Viễn tưởng
              </Link>
            </div>
            
            {isLoggedIn ? (
              <div className="pt-2 border-t border-gray-700">
                <Link 
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Trang cá nhân
                </Link>
                <Link 
                  href="/profile?tab=favorites"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Phim yêu thích
                </Link>
                <Link 
                  href="/profile?tab=history"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Lịch sử xem
                </Link>
                <Link 
                  href="/profile?tab=settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cài đặt
                </Link>
                <Link 
                  href="/logout"
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-400"
                >
                  Đăng xuất
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-gray-700">
                <Link 
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:text-red-400"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 