import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { sampleUsers } from '../../mock/initialData';
import { Avatar } from '../common/Avatar';

export const RightSuggestedPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const toggleFollow = (username: string) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setFollowingMap((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  const suggestedList = Object.values(sampleUsers).filter(
    (u) => u.username !== user?.username
  );

  return (
    <aside className="w-[320px] pl-8 py-8 hidden lg:block select-none">
      {/* 1. Current User Mini Profile OR Login CTA */}
      {isAuthenticated && user ? (
        <div className="flex items-center mb-6">
          <div
            onClick={() => navigate(`/${user?.username}`)}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <Avatar src={user?.profile_img_url || ''} size="md" />
            <div className="text-left">
              <div className="text-sm font-semibold text-white group-hover:text-neutral-300">
                {user?.username}
              </div>
              <div className="text-xs text-neutral-400">
                {user?.full_name}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-[#121212] border border-[#262626] rounded-xl flex flex-col items-center space-y-3">
          <p className="text-sm text-neutral-300 text-center">
            로그인하여 친구들의 사진과 동영상을 확인하세요.
          </p>
          <Link
            to="/login"
            className="w-full py-2 text-center bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
          >
            로그인
          </Link>
          <Link to="/signup" className="text-xs text-ig-primary font-semibold hover:underline">
            계정 만들기
          </Link>
        </div>
      )}

      {/* 2. Suggested For You Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-neutral-400">
          회원님을 위한 추천
        </span>
        <button
          onClick={() => alert('추천 회원 전체 목록')}
          className="text-xs font-semibold text-white hover:text-neutral-400 transition-colors"
        >
          모두 보기
        </button>
      </div>

      {/* 3. Suggested Users List */}
      <div className="space-y-3.5">
        {suggestedList.slice(0, 5).map((suggested) => {
          const isFollowing = followingMap[suggested.username] ?? suggested.is_following;

          return (
            <div
              key={suggested.id}
              className="flex items-center justify-between"
            >
              <div
                onClick={() => navigate(`/${suggested.username}`)}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <Avatar src={suggested.profile_img_url} size="sm" />
                <div className="text-left">
                  <div className="flex items-center space-x-1 text-sm font-semibold text-white group-hover:text-neutral-300">
                    <span>{suggested.username}</span>
                    {suggested.is_verified && (
                      <span className="text-ig-primary">
                        <svg className="w-3 h-3 fill-current inline" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    인기 추천
                  </div>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(suggested.username)}
                className={`text-xs font-semibold transition-colors ${
                  isFollowing
                    ? 'text-neutral-400 hover:text-red-400'
                    : 'text-ig-primary hover:text-white'
                }`}
              >
                {isFollowing ? '팔로잉' : '팔로우'}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
