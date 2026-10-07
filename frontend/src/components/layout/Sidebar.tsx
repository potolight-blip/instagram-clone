import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useModalStore } from '../../store/useModalStore';
import { usePostStore } from '../../store/usePostStore';
import { Avatar } from '../common/Avatar';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    openCreatePost,
    isSearchOpen,
    toggleSearch,
    isNotificationsOpen,
    toggleNotifications,
    closeAllDrawers,
  } = useModalStore();
  const { notifications, chatRooms } = usePostStore();

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;
  const unreadMessagesCount = chatRooms.filter((c) => c.last_message && !c.last_message.is_read).length;

  const isDrawerOpen = isSearchOpen || isNotificationsOpen;

  const navItems = [
    {
      label: '홈',
      to: '/',
      icon: Home,
      action: () => closeAllDrawers(),
    },
    {
      label: '검색',
      to: '#',
      icon: Search,
      action: () => toggleSearch(),
      active: isSearchOpen,
    },
    {
      label: '탐색 탭',
      to: '/explore',
      icon: Compass,
      action: () => closeAllDrawers(),
    },
    {
      label: '메시지',
      to: '/direct',
      icon: MessageCircle,
      action: () => closeAllDrawers(),
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      label: '알림',
      to: '#',
      icon: Heart,
      action: () => toggleNotifications(),
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      active: isNotificationsOpen,
    },
    {
      label: '만들기',
      to: '#',
      icon: PlusSquare,
      action: () => isAuthenticated ? openCreatePost() : navigate('/login'),
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-black border-r border-[#262626] z-40 transition-all duration-300 flex flex-col justify-between py-6 px-3 select-none ${
        isDrawerOpen
          ? 'w-[72px]'
          : 'w-[72px] xl:w-[245px]'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col space-y-4">
        {/* Logo */}
        <div className="h-14 flex items-center px-3 mb-2">
          {isDrawerOpen ? (
            <NavLink to="/" onClick={closeAllDrawers} className="mx-auto text-white">
              {/* Camera icon / IG Glyph */}
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z" />
              </svg>
            </NavLink>
          ) : (
            <>
              {/* Full Wordmark Logo for Desktop */}
              <NavLink
                to="/"
                onClick={closeAllDrawers}
                className="hidden xl:block text-2xl font-bold tracking-tight text-white font-serif hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <span className="bg-gradient-to-r from-white via-neutral-200 to-white bg-clip-text text-transparent font-extrabold tracking-tight text-2xl">
                  Instagram
                </span>
              </NavLink>

              {/* Minimal Glyph for Tablet */}
              <NavLink
                to="/"
                onClick={closeAllDrawers}
                className="xl:hidden mx-auto text-white hover:scale-105 transition-transform"
              >
                <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z" />
                </svg>
              </NavLink>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isCurrent = item.to !== '#' && location.pathname === item.to;
            const isActive = item.active || isCurrent;

            return (
              <button
                key={idx}
                onClick={item.action}
                className={`flex items-center w-full p-3 rounded-lg text-neutral-300 hover:bg-[#121212] hover:text-white transition-all group relative ${
                  isActive ? 'font-bold text-white' : 'font-normal'
                } ${isDrawerOpen ? 'justify-center' : 'justify-center xl:justify-start'}`}
                title={item.label}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-6 h-6 transition-transform group-hover:scale-105 ${
                      isActive ? 'stroke-[2.5px] text-white' : 'stroke-[1.8px]'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-ig-like text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>

                {!isDrawerOpen && (
                  <span className="hidden xl:inline ml-4 text-[15px]">
                    {item.label}
                  </span>
                )}

                <span
                  className={`pointer-events-none absolute left-full ml-3 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#363636] bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 ${
                    !isDrawerOpen ? 'xl:hidden' : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Profile Item */}
          <NavLink
            to={isAuthenticated ? `/${user?.username || 'test'}` : '/login'}
            onClick={closeAllDrawers}
            className={`flex items-center w-full p-3 rounded-lg text-neutral-300 hover:bg-[#121212] hover:text-white transition-all group relative ${
              location.pathname === `/${user?.username}` ? 'font-bold text-white' : ''
            } ${isDrawerOpen ? 'justify-center' : 'justify-center xl:justify-start'}`}
            title="프로필"
          >
            <div className="flex items-center justify-center">
              <Avatar
                src={user?.profile_img_url || ''}
                size="sm"
                className={`ring-2 ${
                  location.pathname === `/${user?.username}`
                    ? 'ring-white'
                    : 'ring-transparent'
                }`}
              />
            </div>
            {!isDrawerOpen && (
              <span className="hidden xl:inline ml-4 text-[15px]">
                프로필
              </span>
            )}
            <span
              className={`pointer-events-none absolute left-full ml-3 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#363636] bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 ${
                !isDrawerOpen ? 'xl:hidden' : ''
              }`}
            >
              프로필
            </span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom Section: More Menu */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => navigate('/settings')}
          className={`flex items-center w-full p-3 rounded-lg text-neutral-300 hover:bg-[#121212] hover:text-white transition-all group relative ${
            isDrawerOpen ? 'justify-center' : 'justify-center xl:justify-start'
          }`}
          title="설정"
        >
          <Menu className="w-6 h-6" />
          {!isDrawerOpen && (
            <span className="hidden xl:inline ml-4 text-[15px]">
              설정
            </span>
          )}
          <span
            className={`pointer-events-none absolute left-full ml-3 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[#363636] bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 ${
              !isDrawerOpen ? 'xl:hidden' : ''
            }`}
          >
            설정
          </span>
        </button>
      </div>
    </aside>
  );
};
