'use client';

const DAYS = [
  { id: 1, name: 'Пн' },
  { id: 2, name: 'Вт' },
  { id: 3, name: 'Ср' },
  { id: 4, name: 'Чт' },
  { id: 5, name: 'Пт' },
  { id: 6, name: 'Сб' },
  { id: 7, name: 'Вс' },
];

interface Props {
  value: any;
  onChange: (updates: any) => void;
}

export function TimeSection({ value, onChange }: Props) {
  const schedule = value.schedule || { days: [1, 2, 3, 4, 5], hours: { start: 9, end: 21 } };

  const toggleDay = (dayId: number) => {
    const days = schedule.days.includes(dayId)
      ? schedule.days.filter((d: number) => d !== dayId)
      : [...schedule.days, dayId];
    onChange({ schedule: { ...schedule, days } });
  };

  const setHours = (field: 'start' | 'end', value: number) => {
    onChange({ schedule: { ...schedule, hours: { ...schedule.hours, [field]: value } } });
  };

  const presets = [
    { label: 'Рабочие дни', days: [1, 2, 3, 4, 5] },
    { label: 'Все дни', days: [1, 2, 3, 4, 5, 6, 7] },
    { label: 'Выходные', days: [6, 7] },
  ];

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Быстрые шаблоны</label>
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ schedule: { ...schedule, days: preset.days } })}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Дни недели</label>
        <div className="flex gap-2">
          {DAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              className={`w-10 h-10 rounded font-medium ${
                schedule.days.includes(day.id)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Часы показа</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={23}
            value={schedule.hours.start}
            onChange={(e) => setHours('start', parseInt(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
          />
          <span>—</span>
          <input
            type="number"
            min={0}
            max={23}
            value={schedule.hours.end}
            onChange={(e) => setHours('end', parseInt(e.target.value))}
            className="w-20 px-2 py-1 border rounded"
          />
          <span className="text-sm text-gray-600">часов</span>
        </div>
      </div>

      {schedule.days.length === 0 && (
        <p className="text-sm text-yellow-600">⚠️ Выберите хотя бы один день</p>
      )}
    </div>
  );
}
