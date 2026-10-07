import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { SearchDrawer } from './components/layout/SearchDrawer';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { CreatePostModal } from './components/post/CreatePostModal';
import { PostDetailModal } from './components/post/PostDetailModal';
import { StoryViewerModal } from './components/story/StoryViewerModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { DirectPage } from './pages/DirectPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  ChangePasswordPage,
  ContactInfoPage,
  AccountPrivacyPage,
  SwitchAccountPage,
  DeactivateAccountPage,
} from './pages/settings/AccountPages';
import {
  ArchivePage,
  DownloadDataPage,
  HideLikesPage,
} from './pages/settings/ContentPages';
import {
  LanguagePage,
  ThemePage,
  AccessibilityPage,
  HelpCenterPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/settings/AppHelpPages';
import { useSettingsStore } from './store/useSettingsStore';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const theme = useSettingsStore((s) => s.theme);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [theme, reduceMotion]);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col sm:flex-row font-sans selection:bg-ig-primary/30 ${
      theme === 'light' ? 'bg-[#fafafa] text-[#262626]' : 'bg-black text-white selection:text-white'
    }`}>
      {/* Desktop / Tablet Sidebar */}
      <Sidebar />

      {/* Slide-out Panels */}
      <SearchDrawer />
      <NotificationDrawer />

      {/* Mobile Top Header */}
      <TopHeader />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen sm:ml-[72px] xl:ml-[245px] pt-[44px] sm:pt-0 pb-[48px] sm:pb-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/direct" element={<DirectPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/password" element={<ChangePasswordPage />} />
          <Route path="/settings/contact" element={<ContactInfoPage />} />
          <Route path="/settings/account-privacy" element={<AccountPrivacyPage />} />
          <Route path="/settings/switch" element={<SwitchAccountPage />} />
          <Route path="/settings/deactivate" element={<DeactivateAccountPage />} />
          <Route path="/settings/archive" element={<ArchivePage />} />
          <Route path="/settings/download" element={<DownloadDataPage />} />
          <Route path="/settings/hide-likes" element={<HideLikesPage />} />
          <Route path="/settings/language" element={<LanguagePage />} />
          <Route path="/settings/theme" element={<ThemePage />} />
          <Route path="/settings/accessibility" element={<AccessibilityPage />} />
          <Route path="/settings/help" element={<HelpCenterPage />} />
          <Route path="/settings/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/settings/terms" element={<TermsPage />} />
          <Route path="/:username" element={<ProfilePage />} />
          <Route path="/p/:postId" element={<HomePage />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Modals (only available when authenticated) */}
      <CreatePostModal />
      <PostDetailModal />
      <StoryViewerModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
};

export default App;
