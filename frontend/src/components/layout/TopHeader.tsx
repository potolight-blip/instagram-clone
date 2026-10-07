import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';
import { usePostStore } from '../../store/usePostStore';

export const TopHeader: React.FC = () => {
  const { toggleNotifications } = useModalStore();
  const { notifications, chatRooms } = usePostStore();

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;
  const unreadMessagesCount = chatRooms.filter((c) => c.last_message && !c.last_message.is_read).length;

  return (
    <header className="fixed top-0 left-0 right-0 h-[44px] bg-black border-b border-[#262626] z-30 flex items-center justify-between px-4 sm:hidden">
      <NavLink to="/" className="text-xl font-bold tracking-tight text-white font-serif">
        <span className="font-extrabold tracking-tight">Instagram</span>
      </NavLink>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleNotifications}
          className="relative text-white hover:opacity-75 transition-opacity"
          aria-label="알림"
        >
          <Heart className="w-6 h-6 stroke-[1.8px]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ig-like rounded-full" />
          )}
        </button>

        <NavLink
          to="/direct"
          className="relative text-white hover:opacity-75 transition-opacity"
          aria-label="메시지"
        >
          <MessageCircle className="w-6 h-6 stroke-[1.8px]" />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ig-like rounded-full" />
          )}
        </NavLink>
      </div>
    </header>
  );
};
