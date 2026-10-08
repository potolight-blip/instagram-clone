import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { currentUser, TEST_CREDENTIALS } from '../mock/initialData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState(TEST_CREDENTIALS.email);
  const [password, setPassword] = useState(TEST_CREDENTIALS.password);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }

    const id = username.trim().toLowerCase();
    const isTestAccount =
      (id === TEST_CREDENTIALS.email || id === TEST_CREDENTIALS.username) &&
      password === TEST_CREDENTIALS.password;

    if (!isTestAccount) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    setAuth(currentUser, 'mock-jwt-token-xyz');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="flex items-center justify-center max-w-[850px] w-full">
        {/* Left Side: Phone Mockup (Desktop only) */}
        <div className="hidden md:block relative w-[380px] h-[580px] mr-8">
          <div className="w-full h-full rounded-[40px] border-[6px] border-neutral-800 bg-neutral-900 p-3 shadow-2xl relative overflow-hidden">
            {/* Screen Mockup */}
            <div className="w-full h-full rounded-[30px] overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
                alt="Muksta 미리보기"
                className="w-full h-full object-cover animate-pulse [animation-duration:10s]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4">
                <div className="text-white font-bold text-lg font-serif">Muksta</div>
                <div className="text-white text-xs space-y-1">
                  <p className="font-semibold">@traveler_june</p>
                  <p className="text-neutral-300">빛나는 일상의 순간을 함께 나누세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full max-w-[350px] flex flex-col space-y-3">
          <div className="bg-black border border-[#262626] rounded-xl p-8 flex flex-col items-center">
            {/* Muksta Logo */}
            <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight font-serif">
              Muksta
            </h1>

            {error && (
              <div className="w-full p-2.5 mb-4 bg-red-950/60 border border-red-800 rounded text-red-300 text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-2">
              <input
                type="text"
                placeholder="전화번호, 사용자 이름 또는 이메일"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#121212] border border-[#262626] rounded-md px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121212] border border-[#262626] rounded-md px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />

              <button
                type="submit"
                className="w-full py-2 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg mt-2 transition-colors"
              >
                로그인
              </button>
            </form>

            <a href="#" className="text-[11px] text-neutral-400 mt-5 hover:underline">
              비밀번호를 잊으셨나요?
            </a>
          </div>

          {/* Signup Box */}
          <div className="bg-black border border-[#262626] rounded-xl p-4 text-center text-xs text-neutral-300">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-ig-primary font-semibold hover:underline">
              가입하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
