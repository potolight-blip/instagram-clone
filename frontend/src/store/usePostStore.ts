import { create } from 'zustand';
import type { Post, StoryGroup, NotificationItem, ChatRoomItem, UserSummary } from '../types';
import { initialPosts, initialStories, initialNotifications, initialChatRooms } from '../mock/initialData';

interface PostState {
  posts: Post[];
  stories: StoryGroup[];
  notifications: NotificationItem[];
  chatRooms: ChatRoomItem[];
  activeChatRoomId: number | null;

  toggleLike: (postId: number) => void;
  toggleBookmark: (postId: number) => void;
  addComment: (postId: number, content: string, author: UserSummary) => void;
  toggleCommentLike: (postId: number, commentId: number) => void;
  createPost: (
    caption: string,
    location: string,
    mediaUrls: string[],
    author: UserSummary,
    options?: { hide_likes?: boolean; disable_comments?: boolean; aspect_ratio?: '1:1' | '4:5' | '16:9' }
  ) => void;
  markStoryAsSeen: (username: string) => void;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: number) => void;
  setActiveChatRoom: (roomId: number) => void;
  sendMessage: (roomId: number, content: string, sender: UserSummary) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: initialPosts,
  stories: initialStories,
  notifications: initialNotifications,
  chatRooms: initialChatRooms,
  activeChatRoomId: 1,

  toggleLike: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.is_liked;
          return {
            ...post,
            is_liked: isLiked,
            like_count: isLiked ? post.like_count + 1 : Math.max(0, post.like_count - 1),
          };
        }
        return post;
      }),
    }));
  },

  toggleBookmark: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            is_bookmarked: !post.is_bookmarked,
          };
        }
        return post;
      }),
    }));
  },

  addComment: (postId, content, author) => {
    if (!content.trim()) return;
    const newComment = {
      id: Date.now(),
      post_id: postId,
      user_id: author.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      user: author,
      likes_count: 0,
      is_liked: false,
    };

    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comment_count: post.comment_count + 1,
            recent_comments: [...post.recent_comments, newComment],
          };
        }
        return post;
      }),
    }));
  },

  toggleCommentLike: (postId, commentId) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            recent_comments: post.recent_comments.map((c) => {
              if (c.id === commentId) {
                const nextLiked = !c.is_liked;
                return {
                  ...c,
                  is_liked: nextLiked,
                  likes_count: nextLiked ? c.likes_count + 1 : Math.max(0, c.likes_count - 1),
                };
              }
              return c;
            }),
          };
        }
        return post;
      }),
    }));
  },

  createPost: (caption, location, mediaUrls, author, options) => {
    const newPost: Post = {
      id: Date.now(),
      caption,
      location: location || undefined,
      hide_likes: options?.hide_likes ?? false,
      disable_comments: options?.disable_comments ?? false,
      created_at: new Date().toISOString(),
      author,
      media: mediaUrls.map((url, idx) => ({
        id: Date.now() + idx,
        media_url: url,
        media_type: 'IMAGE',
        order_index: idx,
        aspect_ratio: options?.aspect_ratio ?? '1:1',
      })),
      like_count: 0,
      comment_count: 0,
      is_liked: false,
      is_bookmarked: false,
      recent_comments: [],
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
    }));
  },

  markStoryAsSeen: (username) => {
    set((state) => ({
      stories: state.stories.map((group) => {
        if (group.user.username === username) {
          return { ...group, has_unseen: false };
        }
        return group;
      }),
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    }));
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    }));
  },

  setActiveChatRoom: (roomId) => {
    set({ activeChatRoomId: roomId });
  },

  sendMessage: (roomId, content, sender) => {
    if (!content.trim()) return;
    const newMsg = {
      id: Date.now(),
      room_id: roomId,
      sender_id: sender.id,
      sender_username: sender.username,
      content: content.trim(),
      created_at: '방금',
      is_read: true,
    };

    set((state) => ({
      chatRooms: state.chatRooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            last_message: newMsg,
            updated_at: new Date().toISOString(),
          };
        }
        return room;
      }),
    }));
  },
}));
