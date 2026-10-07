import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Heart, Pause, Play } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';
import { usePostStore } from '../../store/usePostStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Avatar } from '../common/Avatar';

export const StoryViewerModal: React.FC = () => {
  const { activeStoryGroup, closeStoryViewer } = useModalStore();
  const { sendMessage, chatRooms } = usePostStore();
  const { user } = useAuthStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const stories = activeStoryGroup?.stories || [];
  const currentStory = stories[currentIdx];

  // 5-second timer with smooth 50ms interval ticks
  useEffect(() => {
    if (!activeStoryGroup || isPaused) return;

    const DURATION = 5000;
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story or close
          if (currentIdx < stories.length - 1) {
            setCurrentIdx((c) => c + 1);
            return 0;
          } else {
            closeStoryViewer();
            return 100;
          }
        }
        return prev + step;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [activeStoryGroup, currentIdx, isPaused, stories.length, closeStoryViewer]);

  if (!activeStoryGroup || !currentStory) return null;

  const handleNext = () => {
    if (currentIdx < stories.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStoryViewer();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;
    const targetRoom = chatRooms.find(
      (r) => r.participant.username === activeStoryGroup.user.username
    );
    if (targetRoom) {
      sendMessage(targetRoom.id, `[스토리 답장] ${replyText}`, user);
    }
    setReplyText('');
    alert(`@${activeStoryGroup.user.username} 님에게 답장을 보냈습니다! 💌`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none overflow-hidden animate-fadeIn">
      {/* Top right close button */}
      <button
        onClick={closeStoryViewer}
        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
      >
        <X className="w-7 h-7" />
      </button>

      {/* Desktop Previous / Next Arrows outside frame */}
      <button
        onClick={handlePrev}
        disabled={currentIdx === 0}
        className={`hidden sm:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center transition-opacity ${
          currentIdx === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-100'
        }`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white items-center justify-center transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 9:16 Story Frame */}
      <div className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl flex flex-col justify-between">
        {/* Story Media Background */}
        <img
          src={currentStory.media_url}
          alt="스토리"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Top Gradient Shadow for readability */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Bottom Gradient Shadow for reply input */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Interactive Click Left/Right Zones */}
        <div
          onClick={handlePrev}
          className="absolute inset-y-16 left-0 w-1/3 z-20 cursor-pointer"
        />
        <div
          onClick={handleNext}
          className="absolute inset-y-16 right-0 w-1/3 z-20 cursor-pointer"
        />

        {/* Top Header with Progress Bars & Author */}
        <div className="relative z-30 p-3">
          {/* Progress Bars */}
          <div className="flex items-center space-x-1 mb-3">
            {stories.map((_, idx) => (
              <div
                key={idx}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white transition-all ease-linear"
                  style={{
                    width:
                      idx < currentIdx
                        ? '100%'
                        : idx === currentIdx
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Header */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2.5">
              <Avatar src={activeStoryGroup.user.profile_img_url} size="sm" />
              <span className="text-sm font-semibold">
                {activeStoryGroup.user.username}
              </span>
              <span className="text-xs text-white/70">3시간</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Caption Overlay (if any) */}
        {currentStory.caption && (
          <div className="relative z-30 px-4 py-2 mx-auto max-w-[85%] bg-black/60 backdrop-blur-md rounded-xl text-center text-sm font-medium text-white shadow-lg">
            {currentStory.caption}
          </div>
        )}

        {/* Bottom Reply Bar */}
        <div className="relative z-30 p-3 flex items-center space-x-2.5">
          <form
            onSubmit={handleSendReply}
            className="flex-1 flex items-center bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2"
          >
            <input
              type="text"
              placeholder={`@${activeStoryGroup.user.username} 님에게 답장 보내기...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-white/70 focus:outline-none"
            />
            {replyText.trim() && (
              <button type="submit" className="text-white hover:text-ig-primary ml-2">
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          <button
            onClick={() => {
              alert('스토리에 좋아요를 보냈습니다! ❤️');
            }}
            className="p-2 text-white hover:text-ig-like transition-colors rounded-full bg-black/40 backdrop-blur-md border border-white/20"
          >
            <Heart className="w-5 h-5 fill-white/20" />
          </button>
        </div>
      </div>
    </div>
  );
};
