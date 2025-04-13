'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  FilmIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  TagIcon,
  TvIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Movies', href: '/movies', icon: FilmIcon },
  { name: 'TV Series', href: '/series', icon: TvIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              } group flex items-center rounded-md px-2 py-2 text-sm font-medium`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-white' : 'text-gray-400'
                } mr-3 h-6 w-6`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}