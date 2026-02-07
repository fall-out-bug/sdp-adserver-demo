'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';
import { settingsApi } from '@/lib/api/settings';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, clearAuth } = useAuthStore();

  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      alert('Профиль обновлен');
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      alert('Пароль изменен');
    },
  });

  // Account delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => settingsApi.deleteAccount(deletePassword),
    onSuccess: () => {
      clearAuth();
      router.push('/');
    },
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new !== passwordForm.confirm) {
      alert('Пароли не совпадают');
      return;
    }

    if (passwordForm.new.length < 8) {
      alert('Минимум 8 символов');
      return;
    }

    passwordMutation.mutate({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
    });
  };

  const handleDeleteAccount = () => {
    if (deletePassword.length < 8) {
      alert('Введите пароль');
      return;
    }
    deleteMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      {/* Profile Settings */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Профиль</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Имя"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            required
          />

          <Button type="submit" disabled={profileMutation.isPending}>
            {profileMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>
      </Card>

      {/* Password Change */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Изменить пароль</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Текущий пароль"
            type="password"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            required
          />

          <Input
            label="Новый пароль"
            type="password"
            value={passwordForm.new}
            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
            required
          />

          <Input
            label="Подтвердите новый пароль"
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            required
          />

          <Button type="submit" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? 'Изменение...' : 'Изменить пароль'}
          </Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Уведомления</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Email уведомления о доходах</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span>Еженедельный отчет</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Уведомления о новых возможностях</span>
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Опасная зона</h2>
        <p className="text-gray-600 mb-4">
          Удаление аккаунта удалит все ваши данные без возможности восстановления.
        </p>
        <Button
          variant="danger"
          onClick={() => setDeleteModal(true)}
        >
          Удалить аккаунт
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold text-red-600 mb-4">
            Удалить аккаунт?
          </h2>
          <p className="text-gray-600 mb-4">
            Это действие необратимо. Все ваши данные будут удалены.
          </p>
          <Input
            label="Введите пароль для подтверждения"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Ваш пароль"
          />
          <div className="flex gap-3 mt-4">
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить аккаунт'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
