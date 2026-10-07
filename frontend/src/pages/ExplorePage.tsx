import React from 'react';
import { Heart, MessageCircle, Copy } from 'lucide-react';
import { explorePosts } from '../mock/initialData';
import { useModalStore } from '../store/useModalStore';

export const ExplorePage: React.FC = () => {
  const { openPostDetail } = useModalStore();

  return (
    <div className="max-w-[975px] mx-auto py-4 sm:py-8 px-1 sm:px-4">
      {/* 3-Column Square Grid */}
      <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-7">
        {explorePosts.map((post) => (
          <div
            key={post.id}
            onClick={() => openPostDetail(post.id)}
            className="relative aspect-square bg-neutral-900 overflow-hidden cursor-pointer group"
          >
            {/* Image */}
            <img
              src={post.media[0]?.media_url}
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Multiple media icon */}
            {post.media.length > 1 && (
              <div className="absolute top-2.5 right-2.5 z-10 text-white drop-shadow">
                <Copy className="w-5 h-5 fill-white/80 stroke-black stroke-[1.5]" />
              </div>
            )}

            {/* Hover Dark Overlay with Stats */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-bold text-sm sm:text-base select-none">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 fill-white stroke-none" />
                <span>{post.like_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 fill-white stroke-none" />
                <span>{post.comment_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
