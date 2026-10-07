import React from 'react';
import { SettingsShell, SettingsCard, ToggleRow } from '../../components/settings/SettingsShell';
import { useSettingsStore } from '../../store/useSettingsStore';
import { usePostStore } from '../../store/usePostStore';
import { useAuthStore } from '../../store/useAuthStore';

export const ArchivePage: React.FC = () => {
  const { stories } = usePostStore();
  const archived = stories.flatMap((group) =>
    group.stories.map((story) => ({ ...story, username: group.user.username }))
  );

  return (
    <SettingsShell title="보관함">
      <p className="text-sm text-neutral-400 mb-4">보관한 스토리가 프로필에 표시되지 않고 여기에만 남습니다.</p>
      {archived.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 text-sm">보관한 항목이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {archived.map((item) => (
            <div key={item.id} className="relative aspect-[9/16] bg-neutral-900 overflow-hidden rounded-md">
              <img src={item.media_url} alt={item.caption || '보관한 스토리'} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-[10px] text-white truncate">{item.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsShell>
  );
};

export const DownloadDataPage: React.FC = () => {
  const { user } = useAuthStore();
  const { downloadRequestedAt, requestDownload } = useSettingsStore();

  const handleDownload = () => {
    requestDownload();
    const payload = {
      username: user?.username,
      email: user?.email,
      exported_at: new Date().toISOString(),
      posts: '포함 예정',
      messages: '포함 예정',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.username || 'instagram'}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SettingsShell title="내 정보 다운로드">
      <SettingsCard>
        <div className="py-4">
          <p className="text-sm text-neutral-300 leading-relaxed">
            사진, 댓글, 프로필 정보를 JSON 파일로 받을 수 있습니다. 요청 후 바로 데모 파일을 내려받습니다.
          </p>
          {downloadRequestedAt && (
            <p className="text-xs text-neutral-500 mt-3">마지막 요청: {new Date(downloadRequestedAt).toLocaleString('ko-KR')}</p>
          )}
        </div>
      </SettingsCard>
      <button onClick={handleDownload} className="mt-4 w-full py-2.5 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg">
        데이터 파일 받기
      </button>
    </SettingsShell>
  );
};

export const HideLikesPage: React.FC = () => {
  const { hideLikesByDefault, setHideLikesByDefault } = useSettingsStore();
  return (
    <SettingsShell title="좋아요 및 조회수 숨기기">
      <SettingsCard>
        <ToggleRow
          label="새 게시물에서 좋아요 수 숨기기"
          description="앞으로 공유하는 게시물에 좋아요 수와 조회수가 기본적으로 숨겨집니다. 기존 게시물에는 적용되지 않습니다."
          checked={hideLikesByDefault}
          onChange={setHideLikesByDefault}
        />
      </SettingsCard>
    </SettingsShell>
  );
};
