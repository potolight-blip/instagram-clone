import React from 'react';
import { StoryTray } from '../components/feed/StoryTray';
import { PostCard } from '../components/feed/PostCard';
import { RightSuggestedPanel } from '../components/feed/RightSuggestedPanel';
import { usePostStore } from '../store/usePostStore';

export const HomePage: React.FC = () => {
  const { posts } = usePostStore();

  return (
    <div className="flex flex-col min-h-[calc(100vh-48px)] sm:min-h-screen">
      <div className="flex justify-center w-full flex-1 px-0 sm:px-4">
        {/* Central Feed Column */}
        <main className="w-full max-w-[630px] flex flex-col items-center">
          {/* Story Tray */}
          <StoryTray />

          {/* Post Feed List */}
          <div className="w-full space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* End of feed message */}
          <div className="py-12 text-center text-neutral-500 text-sm">
            <div className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-neutral-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p className="font-semibold text-white">모두 확인했습니다</p>
            <p className="text-xs text-neutral-400 mt-1">지난 3일 동안 올라온 새로운 게시물을 모두 보았습니다.</p>
          </div>
        </main>

        {/* Right Suggested Panel */}
        <RightSuggestedPanel />
      </div>

      <footer className="w-full mt-auto border-t border-[#262626] px-4 py-8 text-center text-[11px] text-neutral-500 leading-relaxed">
        <div className="max-w-[935px] mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <a href="#" className="hover:underline">소개</a> •
          <a href="#" className="hover:underline">도움말</a> •
          <a href="#" className="hover:underline">홍보 센터</a> •
          <a href="#" className="hover:underline">API</a> •
          <a href="#" className="hover:underline">채용 정보</a> •
          <a href="#" className="hover:underline">개인정보처리방침</a> •
          <a href="#" className="hover:underline">약관</a> •
          <a href="#" className="hover:underline">위치</a> •
          <a href="#" className="hover:underline">언어</a>
        </div>
        <div className="mt-3 text-neutral-600 font-medium">
          © 2026 Muksta
        </div>
      </footer>
    </div>
  );
};
