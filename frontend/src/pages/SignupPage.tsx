import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameValue = username.toLowerCase().trim();
    if (!email.trim() || !usernameValue || !password) {
      setError('모든 필수 항목을 입력해 주세요.');
      return;
    }
    if (!/^[a-z0-9_.]{3,30}$/.test(usernameValue)) {
      setError('사용자 이름은 3~30자의 소문자, 숫자, _, . 만 사용할 수 있습니다.');
      return;
    }
    if (password.length < 5) {
      setError('비밀번호는 5자 이상이어야 합니다.');
      return;
    }
    if (fullName.trim().length > 100) {
      setError('이름은 100자 이하여야 합니다.');
      return;
    }

    const newUser = {
      id: Date.now(),
      username: usernameValue,
      email,
      full_name: fullName,
      profile_img_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      is_verified: false,
      is_private: false,
      post_count: 0,
      follower_count: 0,
      following_count: 0,
      is_following: false,
      is_self: true,
    };

    setAuth(newUser, 'mock-jwt-token-new');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[350px] flex flex-col space-y-3">
        <div className="bg-black border border-[#262626] rounded-xl p-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight font-serif">
            Muksta
          </h1>
          <p className="text-sm font-semibold text-neutral-400 mb-5 leading-snug">
            친구들의 사진과 동영상을 보려면 가입하세요.
          </p>

          {error && (
            <div className="w-full p-2 mb-3 bg-red-950/60 border border-red-800 rounded text-red-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="w-full space-y-2 text-left">
            <input
              type="email"
              placeholder="휴대폰 번호 또는 이메일 주소"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-md px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
            <input
              type="text"
              placeholder="성명"
              maxLength={100}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-md px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
            <input
              type="text"
              placeholder="사용자 이름"
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-md px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-md px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />

            <p className="text-[10px] text-neutral-500 text-center py-2 leading-relaxed">
              가입하면 Muksta의 약관, 데이터 정책 및 쿠키 정책에 동의하게 됩니다.
            </p>

            <button
              type="submit"
              className="w-full py-2 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg transition-colors"
            >
              가입
            </button>
          </form>
        </div>

        {/* Login Box */}
        <div className="bg-black border border-[#262626] rounded-xl p-4 text-center text-xs text-neutral-300">
          계정이 있으신가요?{' '}
          <Link to="/login" className="text-ig-primary font-semibold hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
};
