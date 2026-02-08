'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';
import { authApi } from '@/lib/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Пароли не совпадают' });
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Минимум 8 символов' });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        company_name: formData.companyName,
        email: formData.email,
        password: formData.password,
      });

      setAuth(response.user, response.token);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ form: error.response?.data?.error || 'Ошибка регистрации' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded shadow p-8">
          <h1 className="text-2xl font-bold text-center mb-6">
            Регистрация издателя
          </h1>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Название компании"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              error={errors.companyName}
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <Input
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
            />

            <Input
              label="Подтвердите пароль"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary-600 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
