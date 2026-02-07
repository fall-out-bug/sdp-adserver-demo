'use client';

import { useState } from 'react';

const CATEGORIES = [
  { id: 'tech', name: 'Технологии', icon: '💻' },
  { id: 'business', name: 'Бизнес', icon: '💼' },
  { id: 'gaming', name: 'Игры', icon: '🎮' },
  { id: 'news', name: 'Новости', icon: '📰' },
  { id: 'entertainment', name: 'Развлечения', icon: '🎬' },
  { id: 'sports', name: 'Спорт', icon: '⚽' },
  { id: 'health', name: 'Здоровье', icon: '🏥' },
  { id: 'education', name: 'Образование', icon: '📚' },
];

interface Props {
  value: any;
  onChange: (updates: any) => void;
}

export function SiteSection({ value, onChange }: Props) {
  const [siteInput, setSiteInput] = useState('');
  const selectedCategories = value.categories || [];
  const specificSites = value.sites || [];

  const toggleCategory = (id: string) => {
    const categories = selectedCategories.includes(id)
      ? selectedCategories.filter((c: string) => c !== id)
      : [...selectedCategories, id];
    onChange({ categories, sites: specificSites });
  };

  const addSite = () => {
    if (siteInput.trim() && !specificSites.includes(siteInput.trim())) {
      onChange({ categories: selectedCategories, sites: [...specificSites, siteInput.trim()] });
      setSiteInput('');
    }
  };

  const removeSite = (site: string) => {
    onChange({ categories: selectedCategories, sites: specificSites.filter((s: string) => s !== site) });
  };

  return (
    <div className="space-y-4">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Категории сайтов</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIES.map((category) => (
            <label
              key={category.id}
              className={`border rounded-lg p-3 text-center cursor-pointer transition-colors ${
                selectedCategories.includes(category.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="sr-only"
              />
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-xs">{category.name}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Specific Sites */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Конкретные сайты (опционально)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={siteInput}
            onChange={(e) => setSiteInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSite()}
            placeholder="example.com"
            className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={addSite}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Добавить
          </button>
        </div>

        {specificSites.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {specificSites.map((site: string) => (
              <span
                key={site}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
              >
                {site}
                <button
                  type="button"
                  onClick={() => removeSite(site)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
