interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  onNextDisabled?: boolean;
}

export function WizardLayout({
  currentStep,
  totalSteps,
  children,
  onNext,
  onPrevious,
  onNextDisabled = false,
}: WizardLayoutProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded shadow p-6 mb-6">{children}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          className="px-4 py-2 rounded font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={onPrevious}
          disabled={currentStep === 1}
        >
          ← Back
        </button>
        <button
          className="px-4 py-2 rounded font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={onNext}
          disabled={onNextDisabled}
        >
          {currentStep === totalSteps ? 'Launch Campaign →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
