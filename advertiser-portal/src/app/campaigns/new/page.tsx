'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/lib/stores/wizard';
import { WizardLayout } from '@/components/advertiser/WizardLayout';
import { Step1Details } from '@/components/advertiser/wizard/Step1Details';
import { Step2Budget } from '@/components/advertiser/wizard/Step2Budget';
import { Step3Banners } from '@/components/advertiser/wizard/Step3Banners';
import { Step4Review } from '@/components/advertiser/wizard/Step4Review';
import { campaignsApi } from '@/lib/api/campaigns';

const STEPS = [
  { id: 1, title: 'Детали', component: Step1Details },
  { id: 2, title: 'Бюджет', component: Step2Budget },
  { id: 3, title: 'Баннеры', component: Step3Banners },
  { id: 4, title: 'Проверка', component: Step4Review },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { currentStep, setStep, formData, resetWizard } = useWizardStore();
  const [errors, setErrors] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = () => {
    const validationErrors = validateStep(currentStep);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    if (currentStep < STEPS.length) {
      setStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const handleLaunch = async () => {
    const validationErrors = validateStep(currentStep);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsCreating(true);
    try {
      const campaign = await campaignsApi.create(formData as any);
      resetWizard();
      router.push(`/campaigns/${campaign.id}`);
    } catch (err: any) {
      setErrors([err.response?.data?.error || 'Ошибка создания кампании']);
      setIsCreating(false);
    }
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    if (step === 1) {
      if (!formData.name?.trim()) {
        errors.push('Введите название кампании');
      }
    }

    if (step === 3) {
      if (!formData.banners || formData.banners.length === 0) {
        errors.push('Добавьте хотя бы один баннер');
      }
    }

    if (step === 4) {
      if (!formData.banners || formData.banners.length === 0) {
        errors.push('Добавьте хотя бы один баннер');
      }
    }

    return errors;
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <WizardLayout
      currentStep={currentStep}
      totalSteps={STEPS.length}
      onNext={currentStep === STEPS.length ? handleLaunch : handleNext}
      onPrevious={handlePrevious}
      onNextDisabled={isCreating}
    >
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          <ul className="list-disc list-inside">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <CurrentStepComponent />
    </WizardLayout>
  );
}
