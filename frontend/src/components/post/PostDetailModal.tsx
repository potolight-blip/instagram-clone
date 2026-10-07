import React, { useState } from 'react';
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
import { ModalWrapper } from '../common/ModalWrapper';
import { useModalStore } from '../../store/useModalStore';
import { usePostStore } from '../../store/usePostStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Avatar } from '../common/Avatar';
import { useNavigate } from 'react-router-dom';

export const PostDetailModal: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPostId, closePostDetail } = useModalStore();
  const { posts, toggleLike, toggleBookmark, addComment, toggleCommentLike } = usePostStore();
  const { user } = useAuthStore();

  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [commentInput, setCommentInput] = useState('');

  const post = posts.find((p) => p.id === selectedPostId);

  if (!post) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;
    addComment(post.id, commentInput, user);
    setCommentInput('');
  };

  const nextSlide = () => {
    if (currentMediaIdx < post.media.length - 1) {
      setCurrentMediaIdx((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentMediaIdx > 0) {
      setCurrentMediaIdx((prev) => prev - 1);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard?.writeText(window.location.origin + `/p/${post.id}`);
    alert('게시물 링크가 클립보드에 복사되었습니다! 🔗');
  };

  return (
    <ModalWrapper isOpen={!!selectedPostId} onClose={closePostDetail} maxWidth="max-w-5xl">
      <div className="flex flex-col md:flex-row h-full max-h-[85vh] bg-black">
        {/* Left Side: Media Carousel */}
        <div className="relative w-full md:w-[58%] bg-black flex items-center justify-center select-none overflow-hidden min-h-[350px] md:min-h-[550px]">
          <img
            src={post.media[currentMediaIdx]?.media_url}
            alt="게시물 사진"
            className="w-full h-full object-contain max-h-[85vh]"
          />

          {/* Slider controls */}
          {post.media.length > 1 && (
            <>
              {currentMediaIdx > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentMediaIdx < post.media.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5">
                {post.media.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === currentMediaIdx ? 'bg-ig-primary' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Author, Comments, Actions */}
        <div className="w-full md:w-[42%] flex flex-col justify-between bg-black border-l border-[#262626]">
          {/* 1. Header */}
          <div className="p-4 border-b border-[#262626] flex items-center justify-between">
            <div
              onClick={() => {
                navigate(`/${post.author.username}`);
                closePostDetail();
              }}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <Avatar src={post.author.profile_img_url} size="sm" />
              <div className="text-left text-sm font-semibold text-white group-hover:text-neutral-300">
                {post.author.username}
                {post.location && (
                  <div className="text-xs font-normal text-neutral-400">
                    {post.location}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => alert('게시물 옵션')}
              className="text-neutral-400 hover:text-white"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Comments & Caption Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm max-h-[350px] md:max-h-[380px]">
            {/* Author caption as first comment */}
            <div className="flex items-start space-x-3">
              <Avatar src={post.author.profile_img_url} size="sm" />
              <div className="flex-1 text-left">
                <span className="font-semibold text-white mr-2">
                  {post.author.username}
                </span>
                <span className="text-neutral-200 whitespace-pre-line leading-relaxed">
                  {post.caption}
                </span>
                <div className="text-xs text-neutral-500 mt-1">방금 전</div>
              </div>
            </div>

            {/* Comments List */}
            {post.recent_comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between group">
                <div className="flex items-start space-x-3 flex-1">
                  <Avatar src={comment.user.profile_img_url} size="sm" />
                  <div className="text-left">
                    <span className="font-semibold text-white mr-2">
                      {comment.user.username}
                    </span>
                    <span className="text-neutral-200">{comment.content}</span>
                    <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-1">
                      <span>방금 전</span>
                      {comment.likes_count > 0 && (
                        <span>좋아요 {comment.likes_count}개</span>
                      )}
                      <button className="hover:text-neutral-300">답글 달기</button>
                    </div>
                  </div>
                </div>

                {/* Comment like button */}
                <button
                  onClick={() => toggleCommentLike(post.id, comment.id)}
                  className="p-1 text-neutral-500 hover:text-neutral-300"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      comment.is_liked
                        ? 'fill-ig-like text-ig-like'
                        : 'stroke-[1.5]'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* 3. Action Bar, Likes, Comment Input */}
          <div className="border-t border-[#262626] p-4 bg-black">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  aria-label="좋아요"
                >
                  <Heart
                    className={`w-6 h-6 stroke-[1.8px] ${
                      post.is_liked
                        ? 'fill-ig-like text-ig-like'
                        : 'text-white hover:text-neutral-400'
                    }`}
                  />
                </button>

                <button
                  onClick={() => document.getElementById('modal-comment-input')?.focus()}
                  className="text-white hover:text-neutral-400"
                  aria-label="댓글"
                >
                  <MessageCircle className="w-6 h-6 stroke-[1.8px]" />
                </button>

                <button
                  onClick={handleShareClick}
                  className="text-white hover:text-neutral-400"
                  aria-label="공유"
                >
                  <Send className="w-6 h-6 stroke-[1.8px] -rotate-12" />
                </button>
              </div>

              <button
                onClick={() => toggleBookmark(post.id)}
                aria-label="저장"
              >
                <Bookmark
                  className={`w-6 h-6 stroke-[1.8px] ${
                    post.is_bookmarked
                      ? 'fill-white text-white'
                      : 'text-white hover:text-neutral-400'
                  }`}
                />
              </button>
            </div>

            {/* Like count */}
            {!post.hide_likes && (
              <div className="text-sm font-semibold text-white mb-1">
                좋아요 {post.like_count.toLocaleString()}개
              </div>
            )}
            <div className="text-[11px] text-neutral-500 uppercase tracking-wider mb-3">
              10월 2일
            </div>

            {/* Comment form */}
            <form
              onSubmit={handleCommentSubmit}
              className="flex items-center pt-2 border-t border-[#262626]/50"
            >
              <button
                type="button"
                onClick={() => setCommentInput((p) => p + ' ❤️')}
                className="text-neutral-400 hover:text-white mr-2"
              >
                <Smile className="w-5 h-5" />
              </button>
              <input
                id="modal-comment-input"
                type="text"
                placeholder="댓글 달기..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              {commentInput.trim() && (
                <button
                  type="submit"
                  className="text-sm font-semibold text-ig-primary hover:text-white ml-2"
                >
                  게시
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
