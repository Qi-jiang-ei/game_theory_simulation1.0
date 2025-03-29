import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Activity, Database, BarChart2, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <NavLink to="/" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            博弈论仿真系统
          </NavLink>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 py-2">
          <ul className="flex gap-4">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <BarChart2 className="w-4 h-4" />
                仿真模拟
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/models"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Database className="w-4 h-4" />
                模型管理
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/results"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Activity className="w-4 h-4" />
                仿真结果
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
