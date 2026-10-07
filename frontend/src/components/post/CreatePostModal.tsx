import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, ArrowLeft, MapPin } from 'lucide-react';
import { ModalWrapper } from '../common/ModalWrapper';
import { useModalStore } from '../../store/useModalStore';
import { usePostStore } from '../../store/usePostStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Avatar } from '../common/Avatar';

// Curated high quality presets for instant testing
const samplePhotoPresets = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80',
];

export const CreatePostModal: React.FC = () => {
  const { isCreatePostOpen, closeCreatePost } = useModalStore();
  const { createPost } = usePostStore();
  const { user } = useAuthStore();
  const hideLikesByDefault = useSettingsStore((s) => s.hideLikesByDefault);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [hideLikes, setHideLikes] = useState(false);
  const [disableComments, setDisableComments] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!isCreatePostOpen) return;
    setHideLikes(hideLikesByDefault);
    setDisableComments(false);
  }, [isCreatePostOpen, hideLikesByDefault]);

  const handleClose = () => {
    setStep(1);
    setSelectedImages([]);
    setAspectRatio('1:1');
    setCaption('');
    setLocation('');
    setHideLikes(hideLikesByDefault);
    setDisableComments(false);
    setError('');
    closeCreatePost();
  };

  const isImageFile = (file: File) => file.type.startsWith('image/');

  const applyImageFiles = (files: File[]) => {
    const images = files.filter(isImageFile);
    if (images.length === 0) {
      setError('사진은 이미지만 올릴 수 있습니다. 동영상은 지원하지 않습니다.');
      return;
    }

    if (images.length < files.length) {
      setError('동영상 파일은 제외하고 사진만 추가했습니다.');
    } else {
      setError('');
    }

    const urls = images.slice(0, 10).map((file) => URL.createObjectURL(file));
    setSelectedImages(urls);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      applyImageFiles(Array.from(files));
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      applyImageFiles(files);
    }
  };

  const selectPreset = (url: string) => {
    setSelectedImages([url]);
    setStep(2);
  };

  const handleSubmit = () => {
    if (selectedImages.length === 0 || !user) return;
    createPost(caption, location, selectedImages, user, {
      hide_likes: hideLikes,
      disable_comments: disableComments,
      aspect_ratio: aspectRatio,
    });
    handleClose();
  };

  return (
    <ModalWrapper isOpen={isCreatePostOpen} onClose={handleClose} maxWidth="max-w-2xl">
      {/* Modal Header */}
      <div className="h-12 border-b border-[#363636] flex items-center justify-between px-4 bg-[#262626]">
        {step > 1 ? (
          <button
            onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
            className="text-white hover:text-neutral-400 p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-5" />
        )}

        <span className="font-semibold text-sm text-white">
          {step === 1 && '새 게시물 만들기'}
          {step === 2 && '자르기 및 비율 선택'}
          {step === 3 && '새 게시물 공유하기'}
        </span>

        {step === 1 && <div className="w-5" />}
        {step === 2 && (
          <button
            onClick={() => setStep(3)}
            className="text-sm font-semibold text-ig-primary hover:text-white transition-colors"
          >
            다음
          </button>
        )}
        {step === 3 && (
          <button
            onClick={handleSubmit}
            className="text-sm font-semibold text-ig-primary hover:text-white transition-colors"
          >
            공유하기
          </button>
        )}
      </div>

      {/* Step 1: Select Photos */}
      {step === 1 && (
        <div
          className="flex flex-col items-center justify-center p-8 min-h-[420px] text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mb-4 text-white">
            <ImageIcon className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            사진을 여기에 끌어다 놓으세요
          </h3>
          <p className="text-xs text-neutral-400 mb-2">
            사진만 올릴 수 있습니다. 동영상은 지원하지 않습니다.
          </p>
          <p className="text-xs text-neutral-500 mb-6">
            최대 10장의 이미지를 첨부할 수 있습니다.
          </p>

          {error && (
            <div className="w-full max-w-sm mb-4 p-2.5 bg-red-950/60 border border-red-800 rounded text-red-300 text-xs">
              {error}
            </div>
          )}

          <label className="px-4 py-2 bg-ig-primary hover:bg-ig-primary-hover text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors mb-6 shadow-md">
            컴퓨터에서 사진 선택
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <div className="w-full pt-4 border-t border-[#363636]">
            <p className="text-xs text-neutral-400 mb-3">또는 고화질 샘플 사진으로 즉시 테스트:</p>
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {samplePhotoPresets.map((preset, idx) => (
                <img
                  key={idx}
                  src={preset}
                  alt={`샘플 사진 ${idx + 1}`}
                  onClick={() => selectPreset(preset)}
                  className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border border-neutral-700 hover:border-ig-primary"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Crop & Ratio */}
      {step === 2 && (
        <div className="relative flex flex-col items-center justify-center bg-black min-h-[420px] overflow-hidden">
          <div className="w-full max-h-[460px] flex items-center justify-center p-4">
            <img
              src={selectedImages[0]}
              alt="미리보기"
              className={`max-h-[420px] object-cover rounded-md transition-all ${
                aspectRatio === '1:1'
                  ? 'aspect-square'
                  : aspectRatio === '4:5'
                  ? 'aspect-[4/5]'
                  : 'aspect-video'
              }`}
            />
          </div>

          {/* Aspect Ratio Selector Pills */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700">
            {(['1:1', '4:5', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-white text-black'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Caption & Details */}
      {step === 3 && (
        <div className="flex flex-col md:flex-row min-h-[440px]">
          {/* Left: Media Preview */}
          <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-2">
            <img
              src={selectedImages[0]}
              alt="최종 미리보기"
              className="max-h-[380px] w-full object-cover rounded-md"
            />
          </div>

          {/* Right: Caption & Settings */}
          <div className="w-full md:w-1/2 p-4 flex flex-col justify-between bg-[#262626]">
            <div>
              {/* User info */}
              <div className="flex items-center space-x-3 mb-3">
                <Avatar src={user?.profile_img_url || ''} size="sm" />
                <span className="text-sm font-semibold text-white">
                  {user?.username}
                </span>
              </div>

              {/* Caption Textarea */}
              <div className="relative mb-3">
                <textarea
                  rows={5}
                  maxLength={2200}
                  placeholder="문구를 작성하거나 해시태그를 추가하세요..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-400 resize-none focus:outline-none"
                />
                <div className="text-right text-[11px] text-neutral-500">
                  {caption.length} / 2,200
                </div>
              </div>

              {/* Location Input */}
              <div className="border-t border-[#363636] pt-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="위치 추가 (예: 서울, 대한민국)"
                  maxLength={100}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-[#363636] pt-3 mt-4 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>좋아요 수 및 조회수 숨기기</span>
                <input
                  type="checkbox"
                  checked={hideLikes}
                  onChange={(e) => setHideLikes(e.target.checked)}
                  className="accent-ig-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>댓글 기능 해제</span>
                <input
                  type="checkbox"
                  checked={disableComments}
                  onChange={(e) => setDisableComments(e.target.checked)}
                  className="accent-ig-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};
