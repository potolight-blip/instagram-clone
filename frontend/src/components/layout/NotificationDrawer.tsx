import React from 'react';
import { X, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';
import { usePostStore } from '../../store/usePostStore';
import { Avatar } from '../common/Avatar';
import { useNavigate } from 'react-router-dom';

export const NotificationDrawer: React.FC = () => {
  const { isNotificationsOpen, closeNotifications, openPostDetail } = useModalStore();
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = usePostStore();
  const navigate = useNavigate();

  if (!isNotificationsOpen) return null;

  const handleNotificationClick = (item: any) => {
    markNotificationAsRead(item.id);
    if (item.post_id) {
      openPostDetail(item.post_id);
    } else {
      navigate(`/${item.actor.username}`);
      closeNotifications();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LIKE_POST':
      case 'LIKE_COMMENT':
        return <Heart className="w-3 h-3 fill-ig-like text-ig-like" />;
      case 'COMMENT':
        return <MessageCircle className="w-3 h-3 text-emerald-400" />;
      case 'FOLLOW':
        return <UserPlus className="w-3 h-3 text-ig-primary" />;
      default:
        return null;
    }
  };

  const getMessageText = (type: string) => {
    switch (type) {
      case 'LIKE_POST':
        return '회원님의 사진을 좋아합니다.';
      case 'LIKE_COMMENT':
        return '회원님의 댓글을 좋아합니다.';
      case 'COMMENT':
        return '회원님의 게시물에 댓글을 남겼습니다.';
      case 'FOLLOW':
        return '회원님을 팔로우하기 시작했습니다.';
      default:
        return '새로운 알림이 도착했습니다.';
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 sm:left-[72px] xl:left-[245px] w-full sm:w-[397px] bg-[#000000] border-r border-[#262626] z-40 shadow-2xl flex flex-col animate-slideRight">
      <div className="p-6 border-b border-[#262626] flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">알림</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs font-semibold text-ig-primary hover:text-white"
          >
            모두 읽음
          </button>
          <button
            onClick={closeNotifications}
            className="p-1 rounded-full text-neutral-400 hover:text-white sm:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
          이번 주
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            알림이 없습니다.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                item.is_read ? 'hover:bg-[#121212]' : 'bg-[#181818] hover:bg-[#202020]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar src={item.actor.profile_img_url} size="md" />
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-black rounded-full">
                    {getIcon(item.type)}
                  </div>
                </div>

                <div className="text-left text-xs sm:text-sm">
                  <span className="font-semibold text-white mr-1">
                    {item.actor.username}
                  </span>
                  <span className="text-neutral-300">
                    {getMessageText(item.type)}
                  </span>
                  <span className="ml-1 text-neutral-500 text-xs">
                    {item.created_at}
                  </span>
                </div>
              </div>

              {item.post_thumbnail ? (
                <img
                  src={item.post_thumbnail}
                  alt="게시물 미리보기"
                  className="w-11 h-11 object-cover rounded-md flex-shrink-0 ml-2"
                />
              ) : item.type === 'FOLLOW' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="px-3.5 py-1.5 bg-ig-primary text-white text-xs font-semibold rounded-lg hover:bg-ig-primary-hover transition-colors flex-shrink-0"
                >
                  맞팔로우
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
