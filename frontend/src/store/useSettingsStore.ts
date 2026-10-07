import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LanguageCode = 'ko' | 'en';
export type ThemeMode = 'dark' | 'light';
export type PermissionLevel = 'everyone' | 'following' | 'none';

interface SettingsState {
  language: LanguageCode;
  theme: ThemeMode;
  reduceMotion: boolean;
  showActivityStatus: boolean;
  hideLikesByDefault: boolean;
  tagPermission: PermissionLevel;
  mentionPermission: PermissionLevel;
  twoFactorEnabled: boolean;
  isPrivate: boolean;
  phone: string;
  contactEmail: string;
  pushLikes: boolean;
  pushComments: boolean;
  pushFollows: boolean;
  pushMessages: boolean;
  emailLoginAlerts: boolean;
  emailReminders: boolean;
  blockedUsernames: string[];
  restrictedUsernames: string[];
  downloadRequestedAt: string | null;

  setLanguage: (language: LanguageCode) => void;
  setTheme: (theme: ThemeMode) => void;
  setReduceMotion: (value: boolean) => void;
  setShowActivityStatus: (value: boolean) => void;
  setHideLikesByDefault: (value: boolean) => void;
  setTagPermission: (value: PermissionLevel) => void;
  setMentionPermission: (value: PermissionLevel) => void;
  setTwoFactorEnabled: (value: boolean) => void;
  setIsPrivate: (value: boolean) => void;
  setPhone: (value: string) => void;
  setContactEmail: (value: string) => void;
  setPush: (key: 'pushLikes' | 'pushComments' | 'pushFollows' | 'pushMessages', value: boolean) => void;
  setEmailPref: (key: 'emailLoginAlerts' | 'emailReminders', value: boolean) => void;
  blockUser: (username: string) => void;
  unblockUser: (username: string) => void;
  restrictUser: (username: string) => void;
  unrestrictUser: (username: string) => void;
  requestDownload: () => void;
}

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('theme-light', theme === 'light');
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ko',
      theme: 'dark',
      reduceMotion: false,
      showActivityStatus: true,
      hideLikesByDefault: false,
      tagPermission: 'everyone',
      mentionPermission: 'everyone',
      twoFactorEnabled: false,
      isPrivate: false,
      phone: '',
      contactEmail: 'test@gmail.com',
      pushLikes: true,
      pushComments: true,
      pushFollows: true,
      pushMessages: true,
      emailLoginAlerts: true,
      emailReminders: false,
      blockedUsernames: ['coder_kim'],
      restrictedUsernames: [],
      downloadRequestedAt: null,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setReduceMotion: (reduceMotion) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('reduce-motion', reduceMotion);
        }
        set({ reduceMotion });
      },
      setShowActivityStatus: (showActivityStatus) => set({ showActivityStatus }),
      setHideLikesByDefault: (hideLikesByDefault) => set({ hideLikesByDefault }),
      setTagPermission: (tagPermission) => set({ tagPermission }),
      setMentionPermission: (mentionPermission) => set({ mentionPermission }),
      setTwoFactorEnabled: (twoFactorEnabled) => set({ twoFactorEnabled }),
      setIsPrivate: (isPrivate) => set({ isPrivate }),
      setPhone: (phone) => set({ phone }),
      setContactEmail: (contactEmail) => set({ contactEmail }),
      setPush: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      setEmailPref: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      blockUser: (username) =>
        set((state) => ({
          blockedUsernames: state.blockedUsernames.includes(username)
            ? state.blockedUsernames
            : [...state.blockedUsernames, username],
        })),
      unblockUser: (username) =>
        set((state) => ({
          blockedUsernames: state.blockedUsernames.filter((name) => name !== username),
        })),
      restrictUser: (username) =>
        set((state) => ({
          restrictedUsernames: state.restrictedUsernames.includes(username)
            ? state.restrictedUsernames
            : [...state.restrictedUsernames, username],
        })),
      unrestrictUser: (username) =>
        set((state) => ({
          restrictedUsernames: state.restrictedUsernames.filter((name) => name !== username),
        })),
      requestDownload: () => set({ downloadRequestedAt: new Date().toISOString() }),
    }),
    {
      name: 'ig-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyTheme(state.theme);
        if (typeof document !== 'undefined' && state?.reduceMotion) {
          document.documentElement.classList.toggle('reduce-motion', state.reduceMotion);
        }
      },
    }
  )
);
