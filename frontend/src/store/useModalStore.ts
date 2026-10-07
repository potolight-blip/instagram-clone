import { create } from 'zustand';
import type { StoryGroup } from '../types';

interface ModalState {
  isCreatePostOpen: boolean;
  selectedPostId: number | null;
  activeStoryGroup: StoryGroup | null;
  isSearchOpen: boolean;
  isNotificationsOpen: boolean;

  openCreatePost: () => void;
  closeCreatePost: () => void;
  openPostDetail: (postId: number) => void;
  closePostDetail: () => void;
  openStoryViewer: (group: StoryGroup) => void;
  closeStoryViewer: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  toggleNotifications: () => void;
  closeNotifications: () => void;
  closeAllDrawers: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreatePostOpen: false,
  selectedPostId: null,
  activeStoryGroup: null,
  isSearchOpen: false,
  isNotificationsOpen: false,

  openCreatePost: () => set({ isCreatePostOpen: true, isSearchOpen: false, isNotificationsOpen: false }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),

  openPostDetail: (postId: number) => set({ selectedPostId: postId }),
  closePostDetail: () => set({ selectedPostId: null }),

  openStoryViewer: (group: StoryGroup) => set({ activeStoryGroup: group }),
  closeStoryViewer: () => set({ activeStoryGroup: null }),

  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen, isNotificationsOpen: false })),
  closeSearch: () => set({ isSearchOpen: false }),

  toggleNotifications: () => set((state) => ({ isNotificationsOpen: !state.isNotificationsOpen, isSearchOpen: false })),
  closeNotifications: () => set({ isNotificationsOpen: false }),

  closeAllDrawers: () => set({ isSearchOpen: false, isNotificationsOpen: false }),
}));
