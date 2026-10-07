import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusSquare } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { Avatar } from '../common/Avatar';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { openCreatePost } = useModalStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[48px] bg-black border-t border-[#262626] z-30 flex items-center justify-around px-2 sm:hidden">
      <NavLink
        to="/"
        aria-label="홈"
        className={({ isActive }) =>
          `p-2 text-white ${isActive ? 'opacity-100' : 'opacity-70'}`
        }
      >
        <Home className="w-6 h-6 stroke-[1.8px]" />
      </NavLink>

      <NavLink
        to="/explore"
        aria-label="탐색 탭"
        className={({ isActive }) =>
          `p-2 text-white ${isActive ? 'opacity-100' : 'opacity-70'}`
        }
      >
        <Compass className="w-6 h-6 stroke-[1.8px]" />
      </NavLink>

      <button
        onClick={() => isAuthenticated ? openCreatePost() : navigate('/login')}
        className="p-2 text-white opacity-90 hover:opacity-100"
        aria-label="만들기"
      >
        <PlusSquare className="w-6 h-6 stroke-[1.8px]" />
      </button>

      <NavLink to={isAuthenticated ? `/${user?.username || 'test'}` : '/login'} className="p-1" aria-label="프로필">
        <Avatar src={user?.profile_img_url || ''} size="xs" />
      </NavLink>
    </nav>
  );
};
