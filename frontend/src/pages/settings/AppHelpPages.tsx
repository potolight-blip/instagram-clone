import React, { useState } from 'react';
import { SettingsShell, SettingsCard, ToggleRow, RadioRow } from '../../components/settings/SettingsShell';
import { useSettingsStore } from '../../store/useSettingsStore';

export const LanguagePage: React.FC = () => {
  const { language, setLanguage } = useSettingsStore();
  return (
    <SettingsShell title="언어">
      <SettingsCard>
        <RadioRow label="한국어" description="앱 언어를 한국어로 표시합니다." selected={language === 'ko'} onSelect={() => setLanguage('ko')} />
        <RadioRow label="English" description="Display the app in English. (데모에서는 선택만 저장됩니다)" selected={language === 'en'} onSelect={() => setLanguage('en')} />
      </SettingsCard>
      <p className="text-xs text-neutral-500 mt-3">현재 선택: {language === 'ko' ? '한국어' : 'English'}</p>
    </SettingsShell>
  );
};

export const ThemePage: React.FC = () => {
  const { theme, setTheme } = useSettingsStore();
  return (
    <SettingsShell title="테마">
      <SettingsCard>
        <RadioRow label="다크 모드" description="검은 배경으로 표시합니다." selected={theme === 'dark'} onSelect={() => setTheme('dark')} />
        <RadioRow label="라이트 모드" description="밝은 배경으로 표시합니다." selected={theme === 'light'} onSelect={() => setTheme('light')} />
      </SettingsCard>
    </SettingsShell>
  );
};

export const AccessibilityPage: React.FC = () => {
  const { reduceMotion, setReduceMotion } = useSettingsStore();
  return (
    <SettingsShell title="접근성">
      <SettingsCard>
        <ToggleRow
          label="모션 줄이기"
          description="하트 애니메이션과 전환 효과를 줄입니다."
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
      </SettingsCard>
    </SettingsShell>
  );
};

export const HelpCenterPage: React.FC = () => {
  const faqs = [
    { q: '비밀번호를 잊었어요', a: '로그인 화면의 비밀번호를 잊으셨나요?에서 재설정을 요청할 수 있습니다. 데모에서는 테스트 계정 비밀번호 12345를 사용하세요.' },
    { q: '게시물이 보이지 않아요', a: '비공개 계정은 팔로우 승인 후에만 게시물이 표시됩니다. 설정 > 계정 공개 범위에서 상태를 확인하세요.' },
    { q: '메시지를 보낼 수 없어요', a: '왼쪽 메시지 아이콘으로 대화방을 연 뒤 아래 입력창에 내용을 적고 보내기를 누르세요.' },
  ];
  const [open, setOpen] = useState(0);

  return (
    <SettingsShell title="고객센터">
      <p className="text-sm text-neutral-400 mb-4">자주 묻는 질문과 도움말입니다.</p>
      <SettingsCard>
        {faqs.map((item, index) => (
          <button key={item.q} onClick={() => setOpen(index)} className="w-full text-left py-3.5">
            <div className="text-sm font-semibold text-white">{item.q}</div>
            {open === index && <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{item.a}</p>}
          </button>
        ))}
      </SettingsCard>
    </SettingsShell>
  );
};

export const PrivacyPolicyPage: React.FC = () => (
  <SettingsShell title="개인정보처리방침">
    <article className="text-sm text-neutral-300 leading-relaxed space-y-4">
      <p>Muksta는 데모 서비스이며, 입력한 정보는 브라우저와 로컬 SQLite에만 저장됩니다.</p>
      <p>수집 항목: 사용자 이름, 이메일, 프로필 소개, 업로드한 사진, 댓글, 메시지.</p>
      <p>이용 목적: 로그인, 피드 표시, 알림, 다이렉트 메시지 기능 제공.</p>
      <p>보관 기간: 계정을 삭제하거나 브라우저 데이터를 지우면 삭제됩니다. 외부 광고 네트워크와 공유하지 않습니다.</p>
      <p>문의: 설정 &gt; 고객센터</p>
    </article>
  </SettingsShell>
);

export const TermsPage: React.FC = () => (
  <SettingsShell title="약관">
    <article className="text-sm text-neutral-300 leading-relaxed space-y-4">
      <p>Muksta는 학습용으로 만든 데모 서비스이며 Meta를 비롯한 다른 기업과 제휴되어 있지 않습니다.</p>
      <p>사용자는 타인의 권리를 침해하는 콘텐츠를 게시해서는 안 됩니다. 사진만 게시할 수 있으며 동영상 업로드는 지원하지 않습니다.</p>
      <p>계정은 본인이 관리해야 하며, 비밀번호를 다른 사람과 공유하지 마세요.</p>
      <p>데모 데이터는 예고 없이 초기화될 수 있습니다.</p>
    </article>
  </SettingsShell>
);
