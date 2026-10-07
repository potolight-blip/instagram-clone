import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  UserRound,
  Bookmark,
  Globe,
  CircleHelp,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

type SettingsItem = {
  title: string;
  description: string;
  to?: string;
  action?: 'logout';
};

type SettingsGroup = {
  title: string;
  icon: React.ReactNode;
  items: SettingsItem[];
};

const groups: SettingsGroup[] = [
  {
    title: '계정',
    icon: <UserRound className="w-4 h-4" />,
    items: [
      {
        title: '프로필 편집',
        description: '이름, 소개, 프로필 사진을 수정합니다.',
        to: 'profile-edit',
      },
      {
        title: '비밀번호 변경',
        description: '현재 비밀번호를 확인하고 새 비밀번호로 바꿉니다.',
        to: '/settings/password',
      },
      {
        title: '이메일 및 연락처',
        description: '로그인 이메일, 휴대폰 번호를 관리합니다.',
        to: '/settings/contact',
      },
      {
        title: '계정 공개 범위',
        description: '공개 계정 / 비공개 계정을 전환합니다.',
        to: '/settings/account-privacy',
      },
      {
        title: '계정 전환',
        description: '여러 계정을 추가하고 전환합니다.',
        to: '/settings/switch',
      },
      {
        title: '계정 비활성화 또는 삭제',
        description: '계정을 잠시 숨기거나 영구 삭제합니다.',
        to: '/settings/deactivate',
      },
    ],
  },
  {
    title: '콘텐츠',
    icon: <Bookmark className="w-4 h-4" />,
    items: [
      {
        title: '저장됨',
        description: '북마크한 게시물을 확인합니다.',
        to: 'saved',
      },
      {
        title: '보관함',
        description: '보관한 스토리와 게시물을 봅니다.',
        to: '/settings/archive',
      },
      {
        title: '내 정보 다운로드',
        description: '계정 데이터 사본을 요청합니다.',
        to: '/settings/download',
      },
      {
        title: '좋아요 및 조회수 숨기기',
        description: '게시물에 좋아요 수를 기본으로 숨깁니다.',
        to: '/settings/hide-likes',
      },
    ],
  },
  {
    title: '앱',
    icon: <Globe className="w-4 h-4" />,
    items: [
      {
        title: '언어',
        description: '앱 표시 언어를 변경합니다.',
        to: '/settings/language',
      },
      {
        title: '테마',
        description: '라이트 모드 / 다크 모드를 전환합니다.',
        to: '/settings/theme',
      },
      {
        title: '접근성',
        description: '모션 줄이기 등 접근성 옵션을 설정합니다.',
        to: '/settings/accessibility',
      },
    ],
  },
  {
    title: '도움말',
    icon: <CircleHelp className="w-4 h-4" />,
    items: [
      {
        title: '고객센터',
        description: '도움말 문서와 문의 방법을 안내합니다.',
        to: '/settings/help',
      },
      {
        title: '개인정보처리방침',
        description: '개인정보 처리 방침을 확인합니다.',
        to: '/settings/privacy-policy',
      },
      {
        title: '약관',
        description: '서비스 이용약관을 확인합니다.',
        to: '/settings/terms',
      },
    ],
  },
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleItemClick = (item: SettingsItem) => {
    if (item.action === 'logout') {
      logout();
      navigate('/login');
      return;
    }
    if (item.to === 'profile-edit') {
      navigate(`/${user?.username || 'test'}`, { state: { openEdit: true } });
      return;
    }
    if (item.to === 'saved') {
      navigate(`/${user?.username || 'test'}?tab=saved`);
      return;
    }
    if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <div className="max-w-[935px] mx-auto py-6 sm:py-10 px-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">설정</h1>
        <p className="text-sm text-neutral-400 mt-2">
          계정, 콘텐츠, 앱을 한곳에서 관리합니다.
        </p>
      </header>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
              {group.icon}
              <span>{group.title}</span>
            </div>
            <div className="border border-[#262626] rounded-xl overflow-hidden divide-y divide-[#262626]">
              {group.items.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-black hover:bg-[#121212] transition-colors"
                >
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-white">{item.title}</span>
                    <p className="text-xs text-neutral-500 mt-1">{item.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>
        ))}

        <section>
          <div className="border border-[#262626] rounded-xl overflow-hidden">
            <button
              onClick={() => handleItemClick({ title: '로그아웃', description: '', action: 'logout' })}
              className="w-full px-4 py-3.5 text-left text-sm font-semibold text-red-400 hover:bg-[#121212] transition-colors"
            >
              로그아웃
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
