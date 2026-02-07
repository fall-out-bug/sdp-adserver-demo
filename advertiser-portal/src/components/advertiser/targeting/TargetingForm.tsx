'use client';

import { useState } from 'react';
import { useWizardStore } from '@/lib/stores/wizard';
import { Card } from '@/components/ui/Card';
import { GeoSection } from './GeoSection';
import { DeviceSection } from './DeviceSection';
import { TimeSection } from './TimeSection';
import { SiteSection } from './SiteSection';

export function TargetingForm() {
  const { formData, updateFormData } = useWizardStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('geo');

  const targeting = formData.targeting || {
    geo: ['RU'],
    devices: ['desktop', 'mobile'],
    schedule: { days: [1, 2, 3, 4, 5], hours: { start: 9, end: 21 } },
    categories: [],
  };

  const updateTargeting = (updates: any) => {
    updateFormData({
      targeting: { ...targeting, ...updates },
    });
  };

  const sections = [
    { id: 'geo', title: 'География', component: GeoSection },
    { id: 'device', title: 'Устройства', component: DeviceSection },
    { id: 'time', title: 'Расписание', component: TimeSection },
    { id: 'site', title: 'Сайты и категории', component: SiteSection },
  ];

  const getSummary = (sectionId: string, targetingValue: any) => {
    switch (sectionId) {
      case 'geo':
        return targetingValue.geo?.length > 0
          ? `${targetingValue.geo.length} ${targetingValue.geo.length === 1 ? 'страна' : 'стран'} выбрано`
          : 'Все страны';
      case 'device':
        return targetingValue.devices?.join(', ') || 'Все устройства';
      case 'time':
        if (targetingValue.schedule?.days?.length === 7) return 'Каждый день';
        if (targetingValue.schedule?.days?.length === 5) return 'Пн-Пт';
        return `${targetingValue.schedule?.days?.length || 0} дней`;
      case 'site':
        return targetingValue.categories?.length > 0
          ? `${targetingValue.categories.length} категорий`
          : 'Все категории';
      default:
        return '';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Настройка таргетинга</h2>

      <div className="space-y-3">
        {sections.map((section) => {
          const SectionComponent = section.component;
          const isExpanded = expandedSection === section.id;

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                type="button"
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <span className="font-semibold">{section.title}</span>
                <span className="text-2xl">{isExpanded ? '−' : '+'}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t">
                  <SectionComponent value={targeting} onChange={updateTargeting} />
                </div>
              )}

              {!isExpanded && (
                <div className="px-4 pb-3 text-sm text-gray-600">
                  {getSummary(section.id, targeting)}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 mt-4">
        <p className="font-semibold mb-1">💡 Совет</p>
        <p>Более узкий таргетинг может снизить объем показов, но повысит релевантность.</p>
      </div>
    </div>
  );
}
