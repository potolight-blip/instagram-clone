import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { useSettingsStore } from '../../store/useSettingsStore';

interface SettingsShellProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsShell: React.FC<SettingsShellProps> = ({ title, children }) => {
  const navigate = useNavigate();
  const isLight = useSettingsStore((s) => s.theme === 'light');

  return (
    <div className={`max-w-[640px] mx-auto py-4 sm:py-8 px-4 ${isLight ? 'text-[#262626]' : 'text-white'}`}>
      <header className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate('/settings')}
          className={`p-1.5 -ml-1 rounded-full hover:bg-[#121212] ${isLight ? 'text-[#262626] hover:bg-neutral-200' : 'text-white'}`}
          aria-label="뒤로"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className={`text-lg font-bold ${isLight ? 'text-[#262626]' : 'text-white'}`}>{title}</h1>
      </header>
      {children}
    </div>
  );
};

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {description && <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${
          checked ? 'bg-ig-primary' : 'bg-[#363636]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
};

interface RadioRowProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

export const RadioRow: React.FC<RadioRowProps> = ({ label, description, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-start justify-between gap-4 py-3.5 text-left"
    >
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {description && <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      <span
        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
          selected ? 'border-ig-primary' : 'border-neutral-500'
        }`}
      >
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-ig-primary" />}
      </span>
    </button>
  );
};

export const SettingsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLight = useSettingsStore((s) => s.theme === 'light');
  return (
    <div
      className={`border rounded-xl px-4 divide-y ${
        isLight
          ? 'border-[#dbdbdb] bg-white divide-[#dbdbdb]'
          : 'border-[#262626] bg-black divide-[#262626]'
      }`}
    >
      {children}
    </div>
  );
};
