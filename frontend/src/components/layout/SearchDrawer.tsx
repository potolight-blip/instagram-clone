import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { sampleUsers, currentUser } from '../../mock/initialData';
import { Avatar } from '../common/Avatar';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/useModalStore';

export const SearchDrawer: React.FC = () => {
  const [query, setQuery] = useState('');
  const { isSearchOpen, closeSearch } = useModalStore();
  const navigate = useNavigate();

  if (!isSearchOpen) return null;

  const allUsers = [currentUser, ...Object.values(sampleUsers)];
  const filteredUsers = query.trim()
    ? allUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(query.toLowerCase())
      )
    : allUsers.slice(0, 4);

  const handleSelectUser = (username: string) => {
    navigate(`/${username}`);
    closeSearch();
  };

  return (
    <div className="fixed inset-y-0 left-0 sm:left-[72px] xl:left-[245px] w-full sm:w-[397px] bg-[#000000] border-r border-[#262626] z-40 shadow-2xl flex flex-col animate-slideRight">
      <div className="p-6 border-b border-[#262626]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">검색</h2>
          <button
            onClick={closeSearch}
            className="p-1 rounded-full text-neutral-400 hover:text-white sm:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#262626] text-white pl-10 pr-9 py-2.5 rounded-lg text-sm placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-sm font-semibold text-white">
            {query ? '검색 결과' : '최근 검색 항목'}
          </span>
          {!query && (
            <button className="text-xs font-semibold text-[#0095F6] hover:text-white">
              모두 지우기
            </button>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            검색 결과가 없습니다.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user.username)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-[#121212] cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar src={user.profile_img_url} size="md" />
                <div className="text-left">
                  <div className="flex items-center space-x-1 font-semibold text-sm text-white">
                    <span>{user.username}</span>
                    {user.is_verified && (
                      <span className="text-ig-primary">
                        <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 truncate max-w-[200px]">
                    {user.full_name}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
