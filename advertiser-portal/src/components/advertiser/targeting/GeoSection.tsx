'use client';

import { useWizardStore } from '@/lib/stores/wizard';

const COUNTRY_LIST = [
  { code: 'RU', name: 'Россия' },
  { code: 'BY', name: 'Беларусь' },
  { code: 'KZ', name: 'Казахстан' },
  { code: 'UA', name: 'Украина' },
  { code: 'UZ', name: 'Узбекистан' },
  { code: 'TR', name: 'Турция' },
  { code: 'DE', name: 'Германия' },
  { code: 'US', name: 'США' },
];

interface Props {
  value: any;
  onChange: (updates: any) => void;
}

export function GeoSection({ value, onChange }: Props) {
  const selectedGeo = value.geo || [];

  const toggleCountry = (code: string) => {
    if (selectedGeo.includes(code)) {
      onChange({ geo: selectedGeo.filter((c: string) => c !== code) });
    } else {
      onChange({ geo: [...selectedGeo, code] });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ geo: COUNTRY_LIST.map((c) => c.code) })}
          className="text-sm text-primary-600 hover:underline"
        >
          Выбрать все
        </button>
        <button
          type="button"
          onClick={() => onChange({ geo: [] })}
          className="text-sm text-primary-600 hover:underline"
        >
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {COUNTRY_LIST.map((country) => (
          <label key={country.code} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={selectedGeo.includes(country.code)}
              onChange={() => toggleCountry(country.code)}
              className="rounded"
            />
            <span className="text-sm">{country.name}</span>
          </label>
        ))}
      </div>

      {selectedGeo.length === 0 && (
        <p className="text-sm text-yellow-600">⚠️ Кампания будет показываться во всех странах</p>
      )}
    </div>
  );
}
