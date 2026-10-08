import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Grid,
  Bookmark,
  UserCheck,
  Settings,
  Heart,
  MessageCircle,
  Copy,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { usePostStore } from '../store/usePostStore';
import { useModalStore } from '../store/useModalStore';
import { sampleUsers } from '../mock/initialData';
import { Avatar } from '../components/common/Avatar';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user: authUser, updateUser } = useAuthStore();
  const { posts } = usePostStore();
  const { openPostDetail } = useModalStore();

  const initialTab = searchParams.get('tab') === 'saved' ? 'saved' : 'posts';
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>(initialTab);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(
    Boolean((location.state as { openEdit?: boolean } | null)?.openEdit)
  );
  const [editName, setEditName] = useState(authUser?.full_name || '');
  const [editBio, setEditBio] = useState(authUser?.bio || '');

  useEffect(() => {
    if (searchParams.get('tab') === 'saved') {
      setActiveTab('saved');
    }
    if ((location.state as { openEdit?: boolean } | null)?.openEdit) {
      setIsEditProfileOpen(true);
    }
  }, [searchParams, location.state]);

  const isSelf = !username || username === authUser?.username;
  const targetUser = isSelf
    ? authUser
    : sampleUsers[username || ''] || {
        id: 99,
        username: username || 'user',
        full_name: 'Muksta 사용자',
        profile_img_url:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        post_count: 12,
        follower_count: 540,
        following_count: 230,
        bio: '안녕하세요! 제 프로필에 오신 것을 환영합니다.',
      };

  // Filter posts
  const userPosts = posts.filter((p) => p.author.username === targetUser?.username);

  const savedPosts = posts.filter((p) => p.is_bookmarked);

  const displayedPosts =
    activeTab === 'posts' ? userPosts : activeTab === 'saved' ? savedPosts : [];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ full_name: editName, bio: editBio });
    setIsEditProfileOpen(false);
  };

  return (
    <div className="max-w-[935px] mx-auto py-6 sm:py-10 px-4 select-none">
      {/* 1. Profile Header */}
      <header className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-16 pb-10 border-b border-[#262626]">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={targetUser?.profile_img_url || ''}
            size="2xl"
            hasStory={true}
            hasUnseenStory={false}
          />
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 text-center sm:text-left space-y-4">
          {/* Username & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
            <h2 className="text-xl font-normal text-white">{targetUser?.username}</h2>

            {isSelf ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-4 py-1.5 bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  프로필 편집
                </button>
                <button
                  onClick={() => navigate('/settings/archive')}
                  className="px-4 py-1.5 bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  보관함 보기
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1.5 text-neutral-300 hover:text-white"
                  aria-label="설정"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFollowing((p) => !p)}
                  className={`px-6 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-[#363636] text-white hover:bg-[#262626]'
                      : 'bg-ig-primary text-white hover:bg-ig-primary-hover'
                  }`}
                >
                  {isFollowing ? '팔로잉' : '팔로우'}
                </button>
                <button
                  onClick={() => navigate('/direct')}
                  className="px-4 py-1.5 bg-[#363636] hover:bg-[#262626] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  메시지 보내기
                </button>
              </div>
            )}
          </div>

          {/* Counts */}
          <div className="flex items-center justify-center sm:justify-start space-x-8 text-sm">
            <div>
              게시물 <span className="font-semibold text-white">{userPosts.length}</span>
            </div>
            <div className="cursor-pointer hover:opacity-80">
              팔로워{' '}
              <span className="font-semibold text-white">
                {(targetUser?.follower_count || 1240).toLocaleString()}
              </span>
            </div>
            <div className="cursor-pointer hover:opacity-80">
              팔로우{' '}
              <span className="font-semibold text-white">
                {(targetUser?.following_count || 320).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bio & Full Name */}
          <div className="text-sm space-y-1">
            <div className="font-semibold text-white">{targetUser?.full_name}</div>
            <div className="text-neutral-200 whitespace-pre-line leading-relaxed">
              {targetUser?.bio}
            </div>
            {targetUser?.website && (
              <a
                href={targetUser.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-ig-primary font-semibold text-xs hover:underline pt-1"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{targetUser.website}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. Tabs */}
      <div className="flex justify-center space-x-12 border-b border-[#262626] text-xs font-semibold uppercase tracking-wider text-neutral-400">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center space-x-2 py-3 border-t-2 -mt-[1px] transition-colors ${
            activeTab === 'posts'
              ? 'border-white text-white'
              : 'border-transparent hover:text-neutral-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>게시물</span>
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center space-x-2 py-3 border-t-2 -mt-[1px] transition-colors ${
              activeTab === 'saved'
                ? 'border-white text-white'
                : 'border-transparent hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>저장됨</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex items-center space-x-2 py-3 border-t-2 -mt-[1px] transition-colors ${
            activeTab === 'tagged'
              ? 'border-white text-white'
              : 'border-transparent hover:text-neutral-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>태그됨</span>
        </button>
      </div>

      {/* 3. Post Grid */}
      <div className="mt-4">
        {displayedPosts.length === 0 ? (
          <div className="py-20 text-center text-neutral-400">
            <div className="w-16 h-16 rounded-full border-2 border-neutral-700 flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeTab === 'saved' ? '저장된 항목 없음' : '게시물 없음'}
            </h3>
            <p className="text-xs text-neutral-500">
              {activeTab === 'saved'
                ? '다시 보고 싶은 사진과 동영상을 저장해보세요.'
                : '사진을 공유하면 프로필에 표시됩니다.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-4 md:gap-7">
            {displayedPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => openPostDetail(post.id)}
                className="relative aspect-square bg-neutral-900 overflow-hidden cursor-pointer group"
              >
                <img
                  src={post.media[0]?.media_url}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {post.media.length > 1 && (
                  <div className="absolute top-2.5 right-2.5 z-10 text-white drop-shadow">
                    <Copy className="w-4 h-4 fill-white/80 stroke-black stroke-[1.5]" />
                  </div>
                )}

                {/* Hover overlay with heart and comments */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-bold text-sm sm:text-base">
                  <div className="flex items-center space-x-1.5">
                    <Heart className="w-5 h-5 fill-white stroke-none" />
                    <span>{post.like_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MessageCircle className="w-5 h-5 fill-white stroke-none" />
                    <span>{post.comment_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#262626] border border-neutral-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">프로필 편집</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">이름</label>
                <input
                  type="text"
                  maxLength={100}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-ig-primary"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">소개 (바이오)</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-ig-primary resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-sm text-neutral-300 hover:text-white"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
