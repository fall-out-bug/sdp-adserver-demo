'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api/campaigns';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PerformanceCards } from '@/components/advertiser/PerformanceCards';
import { TrendChart } from '@/components/advertiser/TrendChart';
import { BreakdownChart } from '@/components/advertiser/BreakdownChart';
import { useRealtimeStats } from '@/lib/hooks/useRealtimeStats';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  // Campaign details
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId),
  });

  // Real-time stats
  const { data: realtimeStats } = useRealtimeStats(campaignId, 30000);

  // Actions
  const pauseMutation = useMutation({
    mutationFn: () => campaignsApi.pause(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => campaignsApi.resume(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });

  if (isLoading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <p>Кампания не найдена</p>
        <button onClick={() => router.push('/dashboard')}>← Назад к кампаниям</button>
      </div>
    );
  }

  const stats = realtimeStats || campaign;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`px-2 py-1 rounded text-sm ${
                campaign.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : campaign.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : campaign.status === 'completed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {campaign.status === 'active'
                ? 'Активна'
                : campaign.status === 'paused'
                ? 'На паузе'
                : campaign.status === 'completed'
                ? 'Завершена'
                : campaign.status === 'draft'
                ? 'Черновик'
                : campaign.status === 'pending_moderation'
                ? 'На модерации'
                : 'Отклонена'}
            </span>
            <span className="text-sm text-gray-600">
              Создана: {new Date(campaign.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {campaign.status === 'active' && (
            <Button
              variant="secondary"
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
            >
              {pauseMutation.isPending ? 'Остановка...' : 'Пауза'}
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button
              onClick={() => resumeMutation.mutate()}
              disabled={resumeMutation.isPending}
            >
              {resumeMutation.isPending ? 'Запуск...' : 'Возобновить'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            Назад
          </Button>
        </div>
      </div>

      {/* Budget Progress */}
      <Card className="mb-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Потрачено</span>
            <span className="font-semibold">
              ${(stats.spent || 0).toFixed(2)} из ${campaign.totalBudget}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all"
              style={{
                width: `${Math.min(((stats.spent || 0) / campaign.totalBudget) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{((((stats.spent || 0) / campaign.totalBudget) * 100).toFixed(1))}% потрачено</span>
            <span>Дневной лимит: ${campaign.dailyCap}</span>
          </div>
        </div>
      </Card>

      {/* Performance Cards */}
      <PerformanceCards stats={stats} />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <h3 className="font-semibold mb-4">Тренд показов и кликов</h3>
          <TrendChart campaignId={campaignId} />
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">По устройствам</h3>
          <BreakdownChart campaignId={campaignId} type="device" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <h3 className="font-semibold mb-4">По географии</h3>
          <BreakdownChart campaignId={campaignId} type="geo" />
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">По баннерам</h3>
          <BreakdownChart campaignId={campaignId} type="banner" />
        </Card>
      </div>
    </div>
  );
}
