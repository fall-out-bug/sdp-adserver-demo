# API Documentation

## Версия SDK: 0.1.0

AdServer Web SDK - это легковесная JavaScript библиотека для доставки рекламы на веб-страницы.

---

## Содержание

1. [Установка](#установка)
2. [Инициализация](#инициализация)
3. [Конфигурация](#конфигурация)
4. [Основной API](#основной-api)
5. [Модули](#модули)
6. [Типы и интерфейсы](#типы-и-интерфейсы)
7. [События](#события)
8. [Отладка](#отладка)

---

## Установка

### Через CDN

```html
<script src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"></script>
```

### Через NPM

```bash
npm install @adserver/web-sdk
```

```javascript
import { AdServerSDK, initSDK } from '@adserver/web-sdk';
```

---

## Инициализация

### Автоматическая инициализация

SDK инициализируется автоматически при загрузке скрипта. Настройки можно передать через:

1. **Атрибуты тега script**:

```html
<script
  src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"
  data-api-endpoint="https://api.adserver.com/v1"
  data-debug="true"
  data-lazy-load="false">
</script>
```

2. **Глобальный конфиг**:

```javascript
window.AdServerSDKConfig = {
  apiEndpoint: 'https://api.adserver.com/v1',
  debug: true,
  lazyLoad: false
};
```

### Ручная инициализация

```javascript
import { initSDK } from '@adserver/web-sdk';

const sdk = initSDK({
  apiEndpoint: 'https://api.adserver.com/v1',
  debug: true
});
```

---

## Конфигурация

### SDKConfig

Основной интерфейс конфигурации:

```typescript
interface SDKConfig {
  // API Configuration
  apiEndpoint?: string;        // Базовый URL API (по умолчанию: '/api/v1')
  apiTimeout?: number;         // Таймаут запросов в мс (по умолчанию: 5000)

  // Behavior
  debug?: boolean;             // Режим отладки (по умолчанию: false)
  testMode?: boolean;          // Тестовый режим (по умолчанию: false)
  lazyLoad?: boolean;          // Ленивая загрузка (по умолчанию: true)

  // Performance
  cacheEnabled?: boolean;      // Включить кеширование (по умолчанию: true)
  cacheTTL?: number;           // Время жизни кеша в мс (по умолчанию: 300000)

  // Retry
  retryEnabled?: boolean;      // Включить повторы (по умолчанию: true)
  retryMaxAttempts?: number;   // Макс. кол-во попыток (по умолчанию: 3)
  retryDelay?: number;         // Задержка между попытками в мс (по умолчанию: 1000)

  // Rendering
  iframeMode?: boolean;        // Режим iframe (по умолчанию: false)
  fallbackEnabled?: boolean;   // Резервный контент (по умолчанию: true)

  // Events
  onInit?: () => void;         // Callback при инициализации
  onReady?: () => void;        // Callback при готовности
  onError?: (error: Error) => void; // Callback при ошибке
}
```

### Атрибуты для конфигурации через script тег:

| Атрибут | Тип | Описание |
|---------|-----|----------|
| `data-api-endpoint` | string | Базовый URL API |
| `data-api-timeout` | number | Таймаут запросов (мс) |
| `data-debug` | boolean | Режим отладки |
| `data-test-mode` | boolean | Тестовый режим |
| `data-lazy-load` | boolean | Ленивая загрузка |
| `data-cache-enabled` | boolean | Включить кеширование |
| `data-cache-ttl` | number | Время жизни кеша (мс) |
| `data-retry-enabled` | boolean | Включить повторы |
| `data-retry-max-attempts` | number | Макс. кол-во попыток |
| `data-retry-delay` | number | Задержка между попытками (мс) |
| `data-iframe-mode` | boolean | Режим iframe |
| `data-fallback-enabled` | boolean | Резервный контент |

---

## Основной API

### AdServerSDK

Главный класс SDK с паттерном Singleton.

#### Методы

##### `init(options?: SDKInitOptions): this`

Инициализирует SDK с указанной конфигурацией.

```javascript
const sdk = AdServerSDK.getInstance();
sdk.init({
  apiEndpoint: 'https://api.adserver.com/v1',
  debug: true
});
```

##### `isInitialized(): boolean`

Проверяет, инициализирован ли SDK.

```javascript
if (sdk.isInitialized()) {
  console.log('SDK готов к работе');
}
```

##### `isReady(): boolean`

Проверяет, готов ли SDK к работе.

```javascript
if (sdk.isReady()) {
  // Можно загружать баннеры
}
```

##### `getConfig(): InternalConfig`

Возвращает текущую конфигурацию.

```javascript
const config = sdk.getConfig();
console.log(config.apiEndpoint);
```

##### `updateConfig(options: Partial<SDKConfig>): void`

Обновляет конфигурацию во время выполнения.

```javascript
sdk.updateConfig({
  debug: false,
  apiTimeout: 10000
});
```

##### `on(event: string, listener: Function): this`

Подписывается на событие.

```javascript
sdk.on('banner-loaded', (data) => {
  console.log('Баннер загружен:', data);
});
```

##### `once(event: string, listener: Function): this`

Подписывается на событие один раз.

```javascript
sdk.once('init', () => {
  console.log('SDK инициализирован');
});
```

##### `off(event: string, listener?: Function): this`

Отписывается от события.

```javascript
const handler = (data) => console.log(data);
sdk.on('event', handler);
sdk.off('event', handler);
```

##### `destroy(): void`

Уничтожает SDK и освобождает ресурсы.

```javascript
sdk.destroy();
```

##### `logger: Logger`

Доступ к логгеру.

```javascript
sdk.logger.info('Информационное сообщение');
sdk.logger.error('Ошибка', error);
```

##### `errorTracker: ErrorTracker`

Доступ к трекеру ошибок.

```javascript
sdk.errorTracker.capture(error, { context: 'additional info' });
```

##### `debug: DebugUtilities`

Утилиты отладки.

```javascript
// Получить информацию о SDK
console.log(sdk.debug.info());

// Получить логи
console.log(sdk.debug.logs());

// Получить ошибки
console.log(sdk.debug.errors());

// Очистить логи и ошибки
sdk.debug.clear();
```

### Вспомогательные функции

##### `getSDK(): AdServerSDK`

Возвращает экземпляр SDK.

```javascript
import { getSDK } from '@adserver/web-sdk';
const sdk = getSDK();
```

##### `initSDK(options?: SDKInitOptions): AdServerSDK`

Инициализирует и возвращает SDK.

```javascript
import { initSDK } from '@adserver/web-sdk';
const sdk = initSDK({ debug: true });
```

---

## Модули

### Cache

Модуль кеширования баннеров в sessionStorage.

#### Функции

##### `getCachedBanner(slotID: string): CachedBanner | null`

Получает закешированный баннер.

```javascript
import { getCachedBanner } from '@adserver/web-sdk';

const banner = getCachedBanner('slot-123');
if (banner) {
  console.log('Баннер в кеше:', banner.html);
}
```

##### `setCachedBanner(slotID: string, banner: CachedBanner): void`

Сохраняет баннер в кеш.

```javascript
import { setCachedBanner } from '@adserver/web-sdk';

setCachedBanner('slot-123', {
  html: '<div>Ad</div>',
  width: 300,
  height: 250,
  clickURL: 'https://click.example.com',
  impression: 'https://impression.example.com',
  campaignID: 'campaign-123'
});
```

##### `removeCachedBanner(slotID: string): void`

Удаляет баннер из кеша.

```javascript
import { removeCachedBanner } from '@adserver/web-sdk';
removeCachedBanner('slot-123');
```

##### `clearCache(): void`

Очищает весь кеш.

```javascript
import { clearCache } from '@adserver/web-sdk';
clearCache();
```

##### `getCacheSize(): number`

Возвращает количество закешированных баннеров.

```javascript
import { getCacheSize } from '@adserver/web-sdk';
console.log('Баннеров в кеше:', getCacheSize());
```

### Client

Модуль для работы с Delivery API.

#### Функции

##### `fetchBanner(request: DeliveryRequest, signal?: AbortSignal): Promise<DeliveryResponse>`

Загружает баннер из API.

```javascript
import { fetchBanner } from '@adserver/web-sdk';

const response = await fetchBanner({
  slotID: 'slot-123',
  width: 300,
  height: 250
});

console.log(response.creative.html);
console.log(response.tracking.impression);
```

##### `fetchBannerCached(request: DeliveryRequest, signal?: AbortSignal): Promise<CachedBanner>`

Загружает баннер и преобразует в формат для кеширования.

```javascript
import { fetchBannerCached } from '@adserver/web-sdk';

const banner = await fetchBannerCached({
  slotID: 'slot-123'
});
```

##### `getDeliveryURL(slotID: string): string`

Возвращает URL для получения баннера.

```javascript
import { getDeliveryURL } from '@adserver/web-sdk';

const url = getDeliveryURL('slot-123');
// https://api.example.com/v1/delivery/slot-123
```

##### `createDeliveryRequest(slotID: string, options?: Partial<DeliveryRequest>): DeliveryRequest`

Создает объект запроса.

```javascript
import { createDeliveryRequest } from '@adserver/web-sdk';

const request = createDeliveryRequest('slot-123', {
  width: 300,
  height: 250
});
```

### Render

Модуль рендеринга баннеров.

#### Функции

##### `renderBanner(slotID: string, container: HTMLElement, options?: RenderOptions): Promise<RenderResult>`

Рендерит баннер в контейнер.

```javascript
import { renderBanner } from '@adserver/web-sdk';

const container = document.getElementById('ad-container');
const result = await renderBanner('slot-123', container, {
  width: 300,
  height: 250,
  useIframe: true,
  fallbackEnabled: true
});

if (result.success) {
  console.log('Баннер отображен методом:', result.method);
}
```

##### `detectContainerSize(element: HTMLElement): { width: number, height: number }`

Определяет размер контейнера.

```javascript
import { detectContainerSize } from '@adserver/web-sdk';

const size = detectContainerSize(container);
console.log('Размер:', size.width, 'x', size.height);
```

##### `autoRender(): void`

Включает автоматический рендеринг баннеров при появлении элементов с `data-slot-id`.

```javascript
import { autoRender } from '@adserver/web-sdk';
autoRender();

// Баннеры будут автоматически рендериться при появлении:
// <div data-slot-id="slot-123"></div>
```

### Loader

Модуль динамической загрузки скриптов.

#### Функции

##### `loadScript(url: string, options?: LoadOptions): Promise<void>`

Загружает скрипт динамически.

```javascript
import { loadScript } from '@adserver/web-sdk';

await loadScript('https://example.com/script.js', {
  timeout: 5000
});
```

##### `preloadScript(url: string): void`

Предзагружает скрипт (не выполняет).

```javascript
import { preloadScript } from '@adserver/web-sdk';
preloadScript('https://example.com/script.js');
```

##### `loadScripts(urls: string[], options?: LoadOptions): Promise<void>`

Загружает несколько скриптов параллельно.

```javascript
import { loadScripts } from '@adserver/web-sdk';

await loadScripts([
  'https://example.com/script1.js',
  'https://example.com/script2.js'
]);
```

##### `loadScriptsWithPriority(scripts: { url: string; critical?: boolean }[], options?: LoadOptions): Promise<void>`

Загружает скрипты с приоритетом.

```javascript
import { loadScriptsWithPriority } from '@adserver/web-sdk';

await loadScriptsWithPriority([
  { url: 'critical.js', critical: true },
  { url: 'deferred.js', critical: false }
]);
```

### EventEmitter

Модуль для работы с событиями.

#### Класс EventEmitter

```javascript
import { EventEmitter } from '@adserver/web-sdk';

const emitter = new EventEmitter({ maxListeners: 100 });

// Подписка
emitter.on('event', (data) => console.log(data));

// Одноразовая подписка
emitter.once('event', (data) => console.log('Once:', data));

// Отписка
emitter.off('event', listener);

// Публикация
emitter.emit('event', { data: 'value' });

// Удаление всех слушателей
emitter.removeAllListeners();

// Количество слушателей
emitter.listenerCount('event');

// Все события
emitter.eventNames();
```

### DebugManager

Модуль отладки.

```javascript
import { DebugManager } from '@adserver/web-sdk';

const debug = new DebugManager({
  enabled: true,
  logLevel: 'debug',
  showBorders: true
});

// Включение/выключение
debug.enable();
debug.disable();

// Очистка
debug.clear();

// Получение статистики
const stats = debug.getStatistics();
```

### PerformanceMonitor

Модуль мониторинга производительности.

```javascript
import { PerformanceMonitor } from '@adserver/web-sdk';

const monitor = new PerformanceMonitor({
  enabled: true,
  collectCoreWebVitals: true
});

// Запуск операции
const endOperation = monitor.startOperation('banner-load');
// ... код ...
endOperation();

// Получение метрик
const metrics = monitor.getMetrics();
console.log(metrics);

// Core Web Vitals
const vitals = monitor.getCoreWebVitals();
```

---

## Типы и интерфейсы

### CachedBanner

```typescript
interface CachedBanner {
  html: string;           // HTML баннера
  width: number;          // Ширина
  height: number;         // Высота
  clickURL: string;       // URL для отслеживания кликов
  impression: string;     // URL для отслеживания показов
  campaignID: string;     // ID кампании
}
```

### DeliveryRequest

```typescript
interface DeliveryRequest {
  slotID: string;         // ID слота
  width?: number;         // Желаемая ширина
  height?: number;        // Желаемая высота
  referer?: string;       // Referrer
}
```

### DeliveryResponse

```typescript
interface DeliveryResponse {
  creative: {
    html: string;         // HTML креатива
    width: number;        // Ширина
    height: number;       // Высота
  };
  tracking: {
    impression: string;   // URL показа
    click: string;        // URL клика
  };
  fallback?: {
    enabled: boolean;     // Включен ли fallback
    html?: string;        // Fallback HTML
  };
}
```

### RenderOptions

```typescript
interface RenderOptions {
  width?: number;            // Ширина
  height?: number;           // Высота
  referer?: string;          // Referrer
  useIframe?: boolean;       // Использовать iframe
  fallbackEnabled?: boolean; // Включить fallback
}
```

### RenderResult

```typescript
interface RenderResult {
  success: boolean;          // Успешно ли
  method: 'direct' | 'iframe' | 'fallback' | 'cache';
  banner?: CachedBanner;     // Баннер (если успешно)
  error?: Error;             // Ошибка (если неуспешно)
}
```

---

## События

SDK генерирует следующие события:

### События жизненного цикла

| Событие | Описание | Данные |
|---------|----------|--------|
| `init` | SDK инициализирован | `InternalConfig` |
| `ready` | SDK готов к работе | `InternalConfig` |
| `destroy` | SDK уничтожен | - |
| `error` | Произошла ошибка | `Error` |

### События баннеров

| Событие | Описание | Данные |
|---------|----------|--------|
| `banner-loaded` | Баннер загружен | `{ slotID, banner }` |
| `banner-rendered` | Баннер отрендерен | `{ slotID, method }` |
| `banner-error` | Ошибка баннера | `{ slotID, error }` |
| `impression` | Показ баннера | `{ slotID, impressionURL }` |
| `click` | Клик по баннеру | `{ slotID, clickURL }` |

### Пример подписки

```javascript
// Через SDK
sdk.on('banner-loaded', (data) => {
  console.log('Баннер загружен:', data.slotID);
});

// Через EventEmitter
import { getEventEmitter } from '@adserver/web-sdk';
const emitter = getEventEmitter();
emitter.on('banner-click', (data) => {
  console.log('Клик:', data.clickURL);
});
```

---

## Отладка

### Включение режима отладки

```javascript
// Через конфиг
sdk.init({ debug: true });

// Через атрибут
<script data-debug="true" src="sdk.js"></script>

// Через глобальный конфиг
window.AdServerSDKConfig = { debug: true };
```

### Логирование

```javascript
// Через логгер SDK
sdk.logger.debug('Debug message');
sdk.logger.info('Info message');
sdk.logger.warn('Warning message');
sdk.logger.error('Error message', error);

// С контекстом
sdk.logger.info('User action', { userId: '123', action: 'click' });
```

### Отслеживание ошибок

```javascript
// Ручное отслеживание
sdk.errorTracker.capture(error, {
  context: 'banner-render',
  slotID: 'slot-123'
});

// Получение всех ошибок
const errors = sdk.errorTracker.getErrors();

// Очистка
sdk.errorTracker.clear();
```

### Инспектор

```javascript
// Информация о SDK
console.log(sdk.debug.info());

// Логи
console.log(sdk.debug.logs());

// Ошибки
console.log(sdk.debug.errors());

// Очистка
sdk.debug.clear();
```

---

## Константы

### VERSION

Версия SDK:

```javascript
import { VERSION } from '@adserver/web-sdk';
console.log(VERSION); // '0.1.0'
```

---

## Глобальные объекты

### window.AdServerSDK

Класс SDK (доступен после загрузки через CDN).

```javascript
const sdk = new window.AdServerSDK();
```

### window.adserver

Экземпляр SDK (singleton).

```javascript
window.adserver.init({ debug: true });
```

---

## Примеры

### Минимальный пример

```html
<div id="ad-slot" data-slot-id="slot-123"></div>

<script src="sdk.min.js"></script>
<script>
  adserver.renderBanner('slot-123', document.getElementById('ad-slot'));
</script>
```

### Полный пример

```javascript
import { initSDK, renderBanner, autoRender } from '@adserver/web-sdk';

// Инициализация
const sdk = initSDK({
  apiEndpoint: 'https://api.adserver.com/v1',
  debug: true,
  cacheEnabled: true,
  retryEnabled: true
});

// Подписка на события
sdk.on('ready', () => {
  console.log('SDK готов');
});

sdk.on('banner-loaded', (data) => {
  console.log('Баннер загружен:', data.slotID);
});

// Рендеринг
const container = document.getElementById('ad-container');
const result = await renderBanner('slot-123', container, {
  width: 300,
  height: 250,
  fallbackEnabled: true
});

// Или автоматический рендеринг
autoRender();
```

---

## Поддержка

- Документация: https://docs.adserver.com
- GitHub: https://github.com/adserver/web-sdk
- Issues: https://github.com/adserver/web-sdk/issues
