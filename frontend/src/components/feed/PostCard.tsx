import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types';
import { Avatar } from '../common/Avatar';
import { HeartAnimation } from '../common/HeartAnimation';
import { useAuthStore } from '../../store/useAuthStore';
import { usePostStore } from '../../store/usePostStore';
import { useModalStore } from '../../store/useModalStore';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { toggleLike, toggleBookmark, addComment } = usePostStore();
  const { openPostDetail } = useModalStore();

  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);

  // 비로그인 사용자를 로그인 페이지로 이동시키는 헬퍼
  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    action();
  };

  const lastTapRef = useRef<number>(0);

  // Handle double-tap to like
  const handleMediaClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      requireAuth(() => {
        // Trigger heart burst
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
        if (!post.is_liked) {
          toggleLike(post.id);
          setIsLikeAnimating(true);
          setTimeout(() => setIsLikeAnimating(false), 300);
        }
      });
    }
    lastTapRef.current = now;
  };

  const handleLikeClick = () => {
    requireAuth(() => {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 300);
      toggleLike(post.id);
    });
  };

  const handleBookmarkClick = () => {
    requireAuth(() => {
      setIsBookmarkAnimating(true);
      setTimeout(() => setIsBookmarkAnimating(false), 300);
      toggleBookmark(post.id);
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    requireAuth(() => {
      if (!user) return;
      addComment(post.id, commentText, user);
      setCommentText('');
    });
  };

  const handleShareClick = () => {
    navigator.clipboard?.writeText(window.location.origin + `/p/${post.id}`);
    alert('게시물 링크가 클립보드에 복사되었습니다! 🔗');
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIdx < post.media.length - 1) {
      setCurrentMediaIdx((prev) => prev + 1);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMediaIdx > 0) {
      setCurrentMediaIdx((prev) => prev - 1);
    }
  };

  return (
    <article className="w-full max-w-[600px] mx-auto bg-black border-b border-[#262626] pb-4 mb-4 select-none">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <div
          onClick={() => navigate(`/${post.author.username}`)}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <Avatar
            src={post.author.profile_img_url}
            size="sm"
            hasStory={true}
            hasUnseenStory={false}
          />
          <div className="flex items-center space-x-1.5 text-sm">
            <span className="font-semibold text-white group-hover:text-neutral-300">
              {post.author.username}
            </span>
            {post.author.is_verified && (
              <span className="text-ig-primary">
                <svg className="w-3.5 h-3.5 fill-current inline" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </span>
            )}
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-500 text-xs">방금 전</span>
          </div>
        </div>

        <button
          onClick={() => alert(`@${post.author.username} 님의 게시물 옵션`)}
          className="text-neutral-400 hover:text-white p-1"
          aria-label="옵션"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Media Carousel */}
      <div
        className="relative aspect-square w-full bg-neutral-900 overflow-hidden cursor-pointer group"
        onClick={handleMediaClick}
      >
        <img
          src={post.media[currentMediaIdx]?.media_url}
          alt={`게시물 사진 ${currentMediaIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Double-tap heart pop */}
        <HeartAnimation show={showHeartBurst} />

        {/* Carousel Prev/Next Buttons */}
        {post.media.length > 1 && (
          <>
            {currentMediaIdx > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-85 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {currentMediaIdx < post.media.length - 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-85 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-1.5">
              {post.media.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentMediaIdx
                      ? 'bg-ig-primary scale-125'
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. Action Bar */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center space-x-4">
          {/* Like */}
          <button
            onClick={handleLikeClick}
            className={`transition-transform duration-150 active:scale-75 ${
              isLikeAnimating ? 'animate-like-pop' : ''
            }`}
            aria-label="좋아요"
          >
            <Heart
              className={`w-7 h-7 stroke-[1.8px] transition-colors ${
                post.is_liked
                  ? 'fill-ig-like text-ig-like'
                  : 'text-white hover:text-neutral-400'
              }`}
            />
          </button>

          {/* Comment */}
          <button
            onClick={() => requireAuth(() => openPostDetail(post.id))}
            className="text-white hover:text-neutral-400 transition-colors"
            aria-label="댓글 달기"
          >
            <MessageCircle className="w-7 h-7 stroke-[1.8px]" />
          </button>

          {/* Share */}
          <button
            onClick={handleShareClick}
            className="text-white hover:text-neutral-400 transition-colors"
            aria-label="공유하기"
          >
            <Send className="w-7 h-7 stroke-[1.8px] -rotate-12" />
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmarkClick}
          className={`transition-transform duration-150 active:scale-75 ${
            isBookmarkAnimating ? 'animate-like-pop' : ''
          }`}
          aria-label="저장"
        >
          <Bookmark
            className={`w-7 h-7 stroke-[1.8px] transition-colors ${
              post.is_bookmarked
                ? 'fill-white text-white'
                : 'text-white hover:text-neutral-400'
            }`}
          />
        </button>
      </div>

      {/* 4. Like Count */}
      {!post.hide_likes && (
        <div className="px-3 py-1">
          <span className="font-semibold text-sm text-white">
            좋아요 {post.like_count.toLocaleString()}개
          </span>
        </div>
      )}

      {/* 5. Caption Area */}
      <div className="px-3 py-1 text-sm leading-relaxed text-white">
        <span
          onClick={() => navigate(`/${post.author.username}`)}
          className="font-semibold mr-2 cursor-pointer hover:underline"
        >
          {post.author.username}
        </span>
        <span className="text-neutral-200 whitespace-pre-line">
          {isCaptionExpanded || post.caption.length < 80
            ? post.caption
            : `${post.caption.slice(0, 80)}... `}
        </span>
        {post.caption.length >= 80 && !isCaptionExpanded && (
          <button
            onClick={() => setIsCaptionExpanded(true)}
            className="text-neutral-500 hover:text-neutral-300 font-medium ml-1"
          >
            더 보기
          </button>
        )}
      </div>

      {/* 6. Comment Preview */}
      {post.comment_count > 0 && (
        <div className="px-3 pt-1">
          <button
            onClick={() => openPostDetail(post.id)}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            댓글 {post.comment_count}개 모두 보기
          </button>

          {/* Show 1 or 2 latest comments */}
          <div className="mt-1 space-y-1">
            {post.recent_comments.slice(-2).map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold mr-2 text-white">
                  {comment.user.username}
                </span>
                <span className="text-neutral-300">{comment.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Instant Comment Input */}
      {!post.disable_comments && (
        <form
          onSubmit={handleCommentSubmit}
          className="mt-2 px-3 pt-2 flex items-center border-t border-[#262626]/40"
        >
          <input
            type="text"
            placeholder={isAuthenticated ? '댓글 달기...' : '댓글을 달려면 로그인하세요'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={() => { if (!isAuthenticated) navigate('/login'); }}
            readOnly={!isAuthenticated}
            className={`flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none py-1 ${
              !isAuthenticated ? 'cursor-pointer' : ''
            }`}
          />
          {commentText.trim() && (
            <button
              type="submit"
              className="text-sm font-semibold text-ig-primary hover:text-white ml-2 transition-colors"
            >
              게시
            </button>
          )}
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setCommentText((prev) => prev + ' ❤️')}
              className="text-neutral-400 hover:text-white ml-2 p-1"
              aria-label="이모지 추가"
            >
              <Smile className="w-4 h-4" />
            </button>
          )}
        </form>
      )}
    </article>
  );
};
