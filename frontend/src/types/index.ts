export interface UserSummary {
  id: number;
  username: string;
  full_name?: string;
  profile_img_url: string;
  is_verified?: boolean;
}

export interface User extends UserSummary {
  email?: string;
  bio?: string;
  website?: string;
  is_private?: boolean;
  post_count?: number;
  follower_count?: number;
  following_count?: number;
  is_following?: boolean;
  is_self?: boolean;
}

export interface PostMedia {
  id: number;
  media_url: string;
  media_type?: 'IMAGE' | 'VIDEO';
  order_index: number;
  aspect_ratio?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  created_at: string;
  user: UserSummary;
  likes_count: number;
  is_liked: boolean;
  replies?: Comment[];
}

export interface Post {
  id: number;
  caption: string;
  location?: string;
  hide_likes: boolean;
  disable_comments: boolean;
  created_at: string;
  author: UserSummary;
  media: PostMedia[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  recent_comments: Comment[];
}

export interface Story {
  id: number;
  media_url: string;
  media_type?: 'IMAGE' | 'VIDEO';
  caption?: string;
  created_at: string;
  expires_at: string;
}

export interface StoryGroup {
  user: UserSummary;
  has_unseen: boolean;
  stories: Story[];
}

export interface NotificationItem {
  id: number;
  actor: UserSummary;
  type: 'LIKE_POST' | 'LIKE_COMMENT' | 'COMMENT' | 'FOLLOW';
  post_id?: number;
  post_thumbnail?: string;
  is_read: boolean;
  created_at: string;
}

export interface MessageItem {
  id: number;
  room_id: number;
  sender_id: number;
  sender_username: string;
  content?: string;
  media_url?: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatRoomItem {
  id: number;
  is_group: boolean;
  room_name?: string;
  participant: UserSummary;
  last_message?: MessageItem;
  updated_at: string;
}
