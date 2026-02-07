'use client';

import Link from 'next/link';
import type { Campaign } from '@/lib/api/campaigns';

interface Props {
  campaigns: Campaign[];
  isLoading: boolean;
}

export function CampaignList({ campaigns, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка кампаний...</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">У вас пока нет кампаний</p>
          <Link
            href="/campaigns/new"
            className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Создать первую кампанию
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'pending_moderation':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'paused':
        return 'На паузе';
      case 'completed':
        return 'Завершена';
      case 'pending_moderation':
        return 'На модерации';
      case 'rejected':
        return 'Отклонена';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Название
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Бюджет
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Потрачено
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Показы
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CTR
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="hover:bg-gray-50 cursor-pointer">
              <Link href={`/campaigns/${campaign.id}`} className="contents">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${campaign.totalBudget}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${campaign.spent.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.impressions.toLocaleString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {campaign.ctr.toFixed(2)}%
                </td>
              </Link>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
