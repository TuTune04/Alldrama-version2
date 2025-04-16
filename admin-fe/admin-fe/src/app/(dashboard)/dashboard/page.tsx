// src/app/(dashboard)/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl text-black font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid text-black grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg text-black font-semibold mb-2">Total Movies</h2>
          <p className="text-3xl text-black font-bold">1,234</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg text-black font-semibold mb-2">Active Users</h2>
          <p className="text-3xl text-black font-bold">5,678</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg text-black font-semibold mb-2">Comments</h2>
          <p className="text-3xl text-black font-bold">9,012</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg text-black font-semibold mb-2">New Today</h2>
          <p className="text-3xl text-black font-bold">42</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg text-black font-semibold mb-4">Recent Activity</h2>
        <p>Activity log will appear here...</p>
      </div>
    </div>
  );
}