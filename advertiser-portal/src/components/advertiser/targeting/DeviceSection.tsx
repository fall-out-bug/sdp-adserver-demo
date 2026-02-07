'use client';

const DEVICES = [
  { id: 'desktop', name: 'Desktop', icon: '🖥️' },
  { id: 'mobile', name: 'Mobile', icon: '📱' },
  { id: 'tablet', name: 'Tablet', icon: '📟' },
];

interface Props {
  value: any;
  onChange: (updates: any) => void;
}

export function DeviceSection({ value, onChange }: Props) {
  const selectedDevices = value.devices || [];

  const toggleDevice = (id: string) => {
    if (selectedDevices.includes(id)) {
      onChange({ devices: selectedDevices.filter((d: string) => d !== id) });
    } else {
      onChange({ devices: [...selectedDevices, id] });
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {DEVICES.map((device) => (
          <label
            key={device.id}
            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-colors ${
              selectedDevices.includes(device.id)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedDevices.includes(device.id)}
              onChange={() => toggleDevice(device.id)}
              className="sr-only"
            />
            <div className="text-3xl mb-2">{device.icon}</div>
            <div className="text-sm font-semibold">{device.name}</div>
          </label>
        ))}
      </div>

      {selectedDevices.length === 0 && (
        <p className="text-sm text-yellow-600">⚠️ Кампания будет показываться на всех устройствах</p>
      )}
    </div>
  );
}
