import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePostStore } from '../../store/usePostStore';
import { useModalStore } from '../../store/useModalStore';
import { Avatar } from '../common/Avatar';
import type { StoryGroup } from '../../types';

export const StoryTray: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { stories, markStoryAsSeen } = usePostStore();
  const { openStoryViewer, openCreatePost } = useModalStore();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleStoryClick = (group: StoryGroup) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    markStoryAsSeen(group.user.username);
    openStoryViewer(group);
  };

  const handleAddStory = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    openCreatePost();
  };

  return (
    <div className="relative group w-full bg-black py-4 mb-2 select-none border-b border-[#262626]/40">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/90 hover:bg-white text-black rounded-full items-center justify-center shadow-lg transition-opacity opacity-0 group-hover:opacity-100"
        aria-label="이전 스토리"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Story Tray List */}
      <div
        ref={scrollContainerRef}
        className="flex items-center space-x-4 overflow-x-auto no-scrollbar px-2 sm:px-4 scroll-smooth"
      >
        {/* Current User Story Item */}
        <div
          onClick={handleAddStory}
          className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer group/user"
        >
          <div className="relative">
            <Avatar src={user?.profile_img_url || ''} size="lg" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-ig-primary rounded-full border-2 border-black flex items-center justify-center text-white">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-xs text-neutral-400 group-hover/user:text-white truncate max-w-[72px]">
            내 스토리
          </span>
        </div>

        {/* Other Users' Stories */}
        {stories.map((group) => (
          <div
            key={group.user.id}
            onClick={() => handleStoryClick(group)}
            className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer group/story"
          >
            <Avatar
              src={group.user.profile_img_url}
              size="lg"
              hasStory={true}
              hasUnseenStory={group.has_unseen}
            />
            <span className="text-xs text-neutral-300 group-story/user:text-white truncate max-w-[72px]">
              {group.user.username}
            </span>
          </div>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/90 hover:bg-white text-black rounded-full items-center justify-center shadow-lg transition-opacity opacity-0 group-hover:opacity-100"
        aria-label="다음 스토리"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
