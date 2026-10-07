import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsShell, SettingsCard, ToggleRow } from '../../components/settings/SettingsShell';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { currentUser, sampleUsers } from '../../mock/initialData';
import { Avatar } from '../../components/common/Avatar';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (currentPassword !== '12345') {
      setError('현재 비밀번호가 올바르지 않습니다.');
      return;
    }
    if (nextPassword.length < 5) {
      setError('새 비밀번호는 5자 이상이어야 합니다.');
      return;
    }
    if (nextPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    setMessage('비밀번호가 변경되었습니다.');
    setCurrentPassword('');
    setNextPassword('');
    setConfirmPassword('');
  };

  return (
    <SettingsShell title="비밀번호 변경">
      <p className="text-sm text-neutral-400 mb-4">보안을 위해 현재 비밀번호를 확인한 뒤 새 비밀번호를 설정하세요.</p>
      {error && <div className="mb-3 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">{error}</div>}
      {message && <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="password" placeholder="현재 비밀번호" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-[#121212] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500" />
        <input type="password" placeholder="새 비밀번호" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} className="w-full bg-[#121212] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500" />
        <input type="password" placeholder="새 비밀번호 확인" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#121212] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500" />
        <button type="submit" className="w-full py-2.5 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg">비밀번호 변경</button>
      </form>
    </SettingsShell>
  );
};

export const ContactInfoPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { contactEmail, phone, setContactEmail, setPhone } = useSettingsStore();
  const [email, setEmail] = useState(contactEmail || user?.email || '');
  const [phoneValue, setPhoneValue] = useState(phone);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setContactEmail(email);
    setPhone(phoneValue);
    updateUser({ email });
    setSaved(true);
  };

  return (
    <SettingsShell title="이메일 및 연락처">
      <p className="text-sm text-neutral-400 mb-4">로그인과 알림에 사용할 연락처를 관리합니다.</p>
      {saved && <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">연락처가 저장되었습니다.</div>}
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs text-neutral-500 block mb-1">이메일</label>
          <input type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#121212] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-500" />
        </div>
        <div>
          <label className="text-xs text-neutral-500 block mb-1">휴대폰 번호</label>
          <input type="tel" maxLength={20} placeholder="010-0000-0000" value={phoneValue} onChange={(e) => setPhoneValue(e.target.value)} className="w-full bg-[#121212] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg">저장</button>
      </form>
    </SettingsShell>
  );
};

export const AccountPrivacyPage: React.FC = () => {
  const { isPrivate, setIsPrivate } = useSettingsStore();
  const { updateUser } = useAuthStore();

  return (
    <SettingsShell title="계정 공개 범위">
      <SettingsCard>
        <ToggleRow
          label="비공개 계정"
          description="비공개로 전환하면 승인한 사람만 사진과 동영상을 볼 수 있습니다. 기존 팔로워는 영향을 받지 않습니다."
          checked={isPrivate}
          onChange={(value) => {
            setIsPrivate(value);
            updateUser({ is_private: value });
          }}
        />
      </SettingsCard>
      <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
        현재 상태: {isPrivate ? '비공개 계정' : '공개 계정'}
      </p>
    </SettingsShell>
  );
};

export const SwitchAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  const accounts = [currentUser, sampleUsers.admin];

  return (
    <SettingsShell title="계정 전환">
      <p className="text-sm text-neutral-400 mb-4">로그인된 계정 사이에서 전환할 수 있습니다.</p>
      <SettingsCard>
        {accounts.map((account) => {
          const active = user?.username === account.username;
          return (
            <button
              key={account.id}
              onClick={() => {
                setAuth(account, 'mock-jwt-token-xyz');
                navigate('/');
              }}
              className="w-full flex items-center justify-between py-3"
            >
              <div className="flex items-center space-x-3">
                <Avatar src={account.profile_img_url} size="sm" />
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{account.username}</div>
                  <div className="text-xs text-neutral-500">{account.full_name}</div>
                </div>
              </div>
              {active && <span className="text-xs font-semibold text-ig-primary">사용 중</span>}
            </button>
          );
        })}
      </SettingsCard>
    </SettingsShell>
  );
};

export const DeactivateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mode, setMode] = useState<'deactivate' | 'delete'>('deactivate');
  const [confirmText, setConfirmText] = useState('');
  const [done, setDone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== (mode === 'delete' ? '삭제' : '비활성화')) {
      return;
    }
    setDone(mode === 'delete' ? '계정이 삭제 예약되었습니다. 로그인 화면으로 이동합니다.' : '계정이 비활성화되었습니다.');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1200);
  };

  return (
    <SettingsShell title="계정 비활성화 또는 삭제">
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setMode('deactivate')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'deactivate' ? 'bg-white text-black' : 'bg-[#262626] text-neutral-300'}`}>비활성화</button>
        <button onClick={() => setMode('delete')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'delete' ? 'bg-red-600 text-white' : 'bg-[#262626] text-neutral-300'}`}>삭제</button>
      </div>
      <SettingsCard>
        <div className="py-4 text-sm text-neutral-300 leading-relaxed">
          {mode === 'deactivate'
            ? '프로필, 사진, 댓글이 숨겨집니다. 다시 로그인하면 계정을 복구할 수 있습니다.'
            : '계정과 콘텐츠가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.'}
        </div>
      </SettingsCard>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={mode === 'delete' ? '삭제 라고 입력' : '비활성화 라고 입력'}
          className="w-full bg-[#121212] border border-[#262626] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none"
        />
        <button type="submit" className={`w-full py-2.5 text-sm font-semibold rounded-lg text-white ${mode === 'delete' ? 'bg-red-600 hover:bg-red-500' : 'bg-[#363636] hover:bg-[#262626]'}`}>
          {mode === 'delete' ? '계정 삭제' : '계정 비활성화'}
        </button>
      </form>
      {done && <p className="text-xs text-neutral-400 mt-3">{done}</p>}
    </SettingsShell>
  );
};
