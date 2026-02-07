import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  fetchBanner,
  fetchBannerCached,
  getDeliveryURL,
  createDeliveryRequest,
  type DeliveryRequest,
  type DeliveryResponse,
} from './client.js';
import { resetConfig, setConfig } from './config.js';

describe('Client', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn() as any;
    global.fetch = mockFetch as any;
    resetConfig();
    setConfig({ apiEndpoint: 'https://api.test.com' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockResponse: DeliveryResponse = {
    creative: {
      html: '<div>Test Ad</div>',
      width: 300,
      height: 250,
    },
    tracking: {
      impression: 'https://api.test.com/impression',
      click: 'https://api.test.com/click',
    },
  };

  describe('fetchBanner', () => {
    it('should fetch banner from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: DeliveryRequest = { slotID: 'slot-1' };
      const response = await fetchBanner(request);

      expect(response).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/delivery/slot-1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
          }),
        })
      );
    });

    it('should include width and height parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: DeliveryRequest = {
        slotID: 'slot-1',
        width: 300,
        height: 250,
      };

      await fetchBanner(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('width=300&height=250'),
        expect.any(Object)
      );
    });

    it('should include referer parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: DeliveryRequest = {
        slotID: 'slot-1',
        referer: 'https://example.com',
      };

      await fetchBanner(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('referer=https%3A%2F%2Fexample.com'),
        expect.any(Object)
      );
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const request: DeliveryRequest = { slotID: 'slot-1' };

      await expect(fetchBanner(request)).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should validate response structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      });

      const request: DeliveryRequest = { slotID: 'slot-1' };

      await expect(fetchBanner(request)).rejects.toThrow('Invalid response structure');
    });

    it('should not retry on 400 error', async () => {
      setConfig({ retryEnabled: true, retryMaxAttempts: 2, retryDelay: 100 });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const request: DeliveryRequest = { slotID: 'slot-1' };

      await expect(fetchBanner(request)).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

  });

  describe('fetchBannerCached', () => {
    it('should convert response to cached format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const request: DeliveryRequest = { slotID: 'slot-1' };
      const cached = await fetchBannerCached(request);

      expect(cached).toEqual({
        html: mockResponse.creative.html,
        width: mockResponse.creative.width,
        height: mockResponse.creative.height,
        clickURL: mockResponse.tracking.click,
        impression: mockResponse.tracking.impression,
        campaignID: '',
      });
    });
  });

  describe('getDeliveryURL', () => {
    it('should return delivery URL for slot', () => {
      setConfig({ apiEndpoint: 'https://api.test.com' });
      const url = getDeliveryURL('slot-1');

      expect(url).toBe('https://api.test.com/delivery/slot-1');
    });

    it('should use default endpoint if not configured', () => {
      resetConfig();
      const url = getDeliveryURL('slot-1');

      expect(url).toBe('/api/v1/delivery/slot-1');
    });
  });

  describe('createDeliveryRequest', () => {
    it('should create request with minimal parameters', () => {
      const request = createDeliveryRequest('slot-1');

      expect(request).toEqual({
        slotID: 'slot-1',
        referer: window.location.href,
      });
    });

    it('should create request with options', () => {
      const request = createDeliveryRequest('slot-1', {
        width: 300,
        height: 250,
        referer: 'https://example.com',
      });

      expect(request).toEqual({
        slotID: 'slot-1',
        width: 300,
        height: 250,
        referer: 'https://example.com',
      });
    });

    it('should default referer to current URL', () => {
      const request = createDeliveryRequest('slot-1');

      expect(request.referer).toBe(window.location.href);
    });
  });
});
