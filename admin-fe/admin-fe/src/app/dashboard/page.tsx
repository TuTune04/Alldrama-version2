import { FilmIcon, UserGroupIcon, PlayIcon, EyeIcon } from '@heroicons/react/24/outline';
import StatCard from '@/components/modules/dashboard/StatCard';

export default function DashboardPage() {
  const stats = [
    { title: 'Total Movies', value: 245, icon: FilmIcon, trend: 12 },
    { title: 'Total Users', value: 1234, icon: UserGroupIcon, trend: 8 },
    { title: 'Active Series', value: 56, icon: PlayIcon, trend: -3 },
    { title: 'Total Views', value: 45678, icon: EyeIcon, trend: 15 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Recent Movies</h2>
          {/* Add recent movies table/list here */}
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
          {/* Add recent users table/list here */}
        </div>
      </div>
    </div>
  );
}