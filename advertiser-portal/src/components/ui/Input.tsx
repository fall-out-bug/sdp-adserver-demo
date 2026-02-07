import { InputHTMLAttributes, useId } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'id'> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function Input({
  label,
  value,
  onChange,
  error,
  className = '',
  ...props
}: InputProps) {
  const inputId = useId();

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
