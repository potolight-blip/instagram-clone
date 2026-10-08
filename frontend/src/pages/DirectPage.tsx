import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Heart, Info, Edit } from 'lucide-react';
import { usePostStore } from '../store/usePostStore';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '../components/common/Avatar';

export const DirectPage: React.FC = () => {
  const { chatRooms, activeChatRoomId, setActiveChatRoom, sendMessage } = usePostStore();
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoom = chatRooms.find((r) => r.id === activeChatRoomId) || chatRooms[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.last_message]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeRoom) return;
    sendMessage(activeRoom.id, inputText, user);
    setInputText('');
  };

  const handleSendHeart = () => {
    if (!user || !activeRoom) return;
    sendMessage(activeRoom.id, '❤️', user);
  };

  return (
    <div className="max-w-[975px] mx-auto h-[calc(100vh-80px)] my-4 border border-[#262626] rounded-xl overflow-hidden flex bg-black">
      {/* 1. Left Conversation List */}
      <div className="w-full sm:w-[350px] border-r border-[#262626] flex flex-col bg-black">
        {/* User bar */}
        <div className="h-16 border-b border-[#262626] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 font-bold text-base text-white">
            <span>{user?.username}</span>
            <svg className="w-4 h-4 fill-current inline" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
          <button className="text-white hover:text-neutral-400 p-1">
            <Edit className="w-5 h-5" />
          </button>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#262626]/20">
          <div className="p-3 text-xs font-semibold text-neutral-400">메시지</div>
          {chatRooms.map((room) => {
            const isActive = room.id === activeRoom?.id;
            return (
              <div
                key={room.id}
                onClick={() => setActiveChatRoom(room.id)}
                className={`flex items-center space-x-3 p-3.5 cursor-pointer transition-colors ${
                  isActive ? 'bg-[#181818]' : 'hover:bg-[#121212]'
                }`}
              >
                <Avatar src={room.participant.profile_img_url} size="md" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold text-white truncate">
                    {room.participant.username}
                  </div>
                  <div className="text-xs text-neutral-400 truncate mt-0.5">
                    {room.last_message?.content || '대화가 없습니다.'}
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 flex-shrink-0">
                  {room.last_message?.created_at || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Right Chat Window */}
      <div className="hidden sm:flex flex-1 flex-col justify-between bg-black">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-[#262626] px-6 flex items-center justify-between bg-black">
              <div className="flex items-center space-x-3">
                <Avatar src={activeRoom.participant.profile_img_url} size="sm" />
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">
                    {activeRoom.participant.username}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {activeRoom.participant.full_name}
                  </div>
                </div>
              </div>

              <button className="text-neutral-400 hover:text-white p-1">
                <Info className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Profile card at top of messages */}
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Avatar src={activeRoom.participant.profile_img_url} size="xl" />
                <h4 className="font-bold text-lg text-white mt-3">
                  {activeRoom.participant.full_name || activeRoom.participant.username}
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  @{activeRoom.participant.username} • Muksta
                </p>
                <button
                  onClick={() => alert('프로필 보기')}
                  className="mt-3 px-4 py-1.5 bg-[#262626] hover:bg-[#363636] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  프로필 보기
                </button>
              </div>

              {/* Sample Dialog History */}
              <div className="flex items-end justify-start space-x-2">
                <Avatar src={activeRoom.participant.profile_img_url} size="xs" />
                <div className="max-w-[70%] bg-[#262626] text-white text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm">
                  안녕하세요! 프로젝트 진행 상황 공유해 주셔서 감사합니다 🙌
                </div>
              </div>

              <div className="flex items-end justify-end">
                <div className="max-w-[70%] bg-[#0095F6] text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm shadow-md">
                  네, 화면 구성과 동작까지 전부 완성되었습니다!
                </div>
              </div>

              {activeRoom.last_message && (
                <div
                  className={`flex items-end ${
                    activeRoom.last_message.sender_username === user?.username
                      ? 'justify-end'
                      : 'justify-start space-x-2'
                  }`}
                >
                  {activeRoom.last_message.sender_username !== user?.username && (
                    <Avatar src={activeRoom.participant.profile_img_url} size="xs" />
                  )}
                  <div
                    className={`max-w-[70%] text-sm px-4 py-2.5 rounded-2xl ${
                      activeRoom.last_message.sender_username === user?.username
                        ? 'bg-[#0095F6] text-white rounded-br-sm'
                        : 'bg-[#262626] text-white rounded-bl-sm'
                    }`}
                  >
                    {activeRoom.last_message.content}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 border-t border-[#262626] bg-black">
              <form
                onSubmit={handleSend}
                className="flex items-center bg-[#181818] border border-[#363636] rounded-full px-4 py-2"
              >
                <button
                  type="button"
                  onClick={() => alert('사진 첨부')}
                  className="text-neutral-400 hover:text-white mr-3"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder="메시지 입력..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
                />

                {inputText.trim() ? (
                  <button
                    type="submit"
                    className="text-sm font-semibold text-ig-primary hover:text-white transition-colors"
                  >
                    보내기
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendHeart}
                    className="text-ig-like hover:scale-110 transition-transform"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4 text-white">
              <Send className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">내 메시지</h3>
            <p className="text-sm text-neutral-400 mb-6">
              친구에게 비밀 사진이나 메시지를 보내보세요.
            </p>
            <button className="px-4 py-2 bg-ig-primary text-white text-sm font-semibold rounded-lg">
              메시지 보내기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
