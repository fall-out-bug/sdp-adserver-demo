'use client';

import { useState } from 'react';
import { useWizardStore } from '@/lib/stores/wizard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function Step3Banners() {
  const { formData, updateFormData } = useWizardStore();
  const [uploadMode, setUploadMode] = useState<'image' | 'html5' | 'amphtml'>('image');
  const [dragActive, setDragActive] = useState(false);
  const [htmlCode, setHtmlCode] = useState('');

  const banners = formData.banners || [];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Неподдерживаемый формат. Используйте JPG, PNG, GIF или WebP.');
      return;
    }

    if (file.size > 500 * 1024) {
      alert('Файл слишком большой. Максимум 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newBanner = {
          id: Date.now().toString(),
          type: 'image' as const,
          content: e.target?.result as string,
          width: img.width,
          height: img.height,
        };

        updateFormData({
          banners: [...banners, newBanner],
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleHtmlUpload = () => {
    if (!htmlCode.trim()) {
      alert('Введите HTML код');
      return;
    }

    const newBanner = {
      id: Date.now().toString(),
      type: uploadMode as 'html5' | 'amphtml',
      content: htmlCode,
      width: 300,
      height: 250,
    };

    updateFormData({
      banners: [...banners, newBanner],
    });
    setHtmlCode('');
  };

  const removeBanner = (id: string) => {
    updateFormData({
      banners: banners.filter((b) => b.id !== id),
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Загрузите баннеры</h2>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={`px-4 py-2 rounded ${uploadMode === 'image' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setUploadMode('image')}
        >
          Изображение
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${uploadMode === 'html5' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setUploadMode('html5')}
        >
          HTML5
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded ${uploadMode === 'amphtml' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setUploadMode('amphtml')}
        >
          AMPHTML
        </button>
      </div>

      {uploadMode === 'image' && (
        <div
          className={`border-2 border-dashed p-8 text-center transition-colors rounded bg-white ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-4xl">📁</div>
            <p className="text-gray-600">
              Перетащите файл сюда или{' '}
              <label className="text-primary-600 cursor-pointer hover:underline">
                выберите файл
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                />
              </label>
            </p>
            <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP (макс. 500KB)</p>
          </div>
        </div>
      )}

      {uploadMode !== 'image' && (
        <Card className="p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTML код ({uploadMode.toUpperCase()})
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {uploadMode === 'html5'
                ? 'HTML5 баннеры поддерживают JavaScript и CSS'
                : 'AMPHTML баннеры используют ограниченный subset HTML'}
            </p>
            <textarea
              className="w-full h-48 font-mono text-sm p-3 border rounded focus:ring-2 focus:ring-primary-500"
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              placeholder="<!DOCTYPE html>
<html>
<head>
  <style>
    /* CSS styles here */
  </style>
</head>
<body>
  <!-- Banner content here -->
</body>
</html>"
            />
          </div>
          <Button onClick={handleHtmlUpload} className="mt-2">Добавить баннер</Button>
        </Card>
      )}

      {banners.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Загруженные баннеры ({banners.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="relative group">
                <div className="bg-gray-100 rounded p-4">
                  <div className="text-center text-sm text-gray-600">
                    {banner.type === 'image' ? (
                      <img src={banner.content as string} alt="Banner" className="max-w-full h-auto" />
                    ) : (
                      <div className="h-32 flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-center mt-1 text-gray-600">
                    {banner.width}×{banner.height}
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeBanner(banner.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {banners.length === 0 && (
        <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800 mt-4">
          ⚠️ Добавьте хотя бы один баннер для продолжения
        </div>
      )}
    </div>
  );
}
