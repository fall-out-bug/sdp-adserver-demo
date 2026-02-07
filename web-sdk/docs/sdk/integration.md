# Руководство по интеграции

## Версия SDK: 0.1.0

Это руководство поможет вам интегрировать AdServer Web SDK на ваш сайт для показа рекламы.

---

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Установка](#установка)
3. [Базовая интеграция](#базовая-интеграция)
4. [Продвинутая настройка](#продвинутая-настройка)
5. [Лучшие практики](#лучшие-практики)
6. [Безопасность](#безопасность)
7. [Производительность](#производительность)
8. [Поиск и устранение проблем](#поиск-и-устранение-проблем)
9. [FAQ](#faq)

---

## Быстрый старт

Минимальная интеграция занимает менее 5 минут:

### 1. Добавьте код на страницу

```html
<!-- Контейнер для рекламы -->
<div id="ad-banner" data-slot-id="ВАШ-SLOT-ID"></div>

<!-- Загрузка SDK -->
<script
  src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"
  data-slot-id="ВАШ-SLOT-ID">
</script>
```

### 2. Всё!

SDK автоматически найдет контейнер с `data-slot-id` и отобразит рекламу.

---

## Установка

### Вариант 1: CDN (рекомендуется)

Просто добавьте тег script на вашу страницу:

```html
<script src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"></script>
```

**Доступные версии:**
- Последняя стабильная: `https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js`
- С источными картами: `https://cdn.adserver.com/sdk/v0.1.0/sdk.js`

### Вариант 2: NPM (для сборщиков)

```bash
npm install @adserver/web-sdk
```

```javascript
import { initSDK, renderBanner } from '@adserver/web-sdk';
```

### Вариант 3: Скачивание

1. Скачайте SDK: https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js
2. Разместите на вашем сервере
3. Подключите:

```html
<script src="/path/to/sdk.min.js"></script>
```

---

## Базовая интеграция

### Шаг 1. Получите Slot ID

Зарегистрируйтесь на https://adserver.com и получите уникальный `slot-id` для каждого рекламного места.

### Шаг 2. Создайте контейнер

Добавьте контейнер для рекламы на вашей странице:

```html
<div id="my-ad-slot" data-slot-id="ВАШ-SLOT-ID"></div>
```

**Важные атрибуты:**
- `data-slot-id` - обязательный атрибут, ваш уникальный ID слота
- `id` - опциональный, для CSS стилей и JavaScript

### Шаг 3. Загрузите SDK

```html
<script src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"></script>
```

### Шаг 4. (Опционально) Настройте

Добавьте настройки через атрибуты:

```html
<script
  src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"
  data-debug="true"
  data-lazy-load="true">
</script>
```

### Готово!

SDK автоматически найдет все контейнеры с `data-slot-id` и отобразит рекламу.

---

## Продвинутая настройка

### Конфигурация через атрибуты

```html
<script
  src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"
  data-api-endpoint="https://api.adserver.com/v1"
  data-api-timeout="5000"
  data-debug="false"
  data-test-mode="false"
  data-lazy-load="true"
  data-cache-enabled="true"
  data-cache-ttl="300000"
  data-retry-enabled="true"
  data-retry-max-attempts="3"
  data-retry-delay="1000"
  data-iframe-mode="false"
  data-fallback-enabled="true">
</script>
```

### Конфигурация через глобальный объект

```html
<script>
  window.AdServerSDKConfig = {
    apiEndpoint: 'https://api.adserver.com/v1',
    debug: false,
    cacheEnabled: true,
    cacheTTL: 300000, // 5 минут
    retryEnabled: true,
    retryMaxAttempts: 3,
    retryDelay: 1000,
    fallbackEnabled: true,
    onReady: () => {
      console.log('AdServer SDK готов');
    },
    onError: (error) => {
      console.error('Ошибка AdServer:', error);
    }
  };
</script>
<script src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"></script>
```

### Программное управление

#### Ручной рендеринг

```javascript
import { initSDK, renderBanner } from '@adserver/web-sdk';

// Инициализация
const sdk = initSDK({
  debug: true,
  cacheEnabled: true
});

// Рендеринг баннера
const container = document.getElementById('my-ad-slot');
const result = await renderBanner('ВАШ-SLOT-ID', container, {
  width: 300,
  height: 250,
  useIframe: false,
  fallbackEnabled: true
});

if (result.success) {
  console.log('Баннер отображен:', result.method);
} else {
  console.error('Ошибка:', result.error);
}
```

#### События

```javascript
// Подписка на события
sdk.on('banner-loaded', (data) => {
  console.log('Баннер загружен:', data.slotID);
});

sdk.on('banner-rendered', (data) => {
  console.log('Баннер отрендерен:', data.method);
  // Отправить в аналитику
  analytics.track('ad_impression', {
    slot: data.slotID,
    method: data.method
  });
});

sdk.on('error', (error) => {
  console.error('Ошибка SDK:', error);
  // Отправить в систему мониторинга
  Sentry.captureException(error);
});
```

#### Динамическое обновление конфигурации

```javascript
sdk.updateConfig({
  debug: false,
  apiTimeout: 10000
});
```

### Несколько рекламных мест

```html
<!-- Шапка -->
<div id="header-ad" data-slot-id="SLOT-HEADER"></div>

<!-- Сайдбар -->
<div id="sidebar-ad" data-slot-id="SLOT-SIDEBAR"></div>

<!-- Подвал -->
<div id="footer-ad" data-slot-id="SLOT-FOOTER"></div>

<script src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"></script>
```

SDK автоматически найдет и заполнит все слоты.

### Адаптивные размеры

```html
<style>
  .ad-container {
    width: 100%;
    height: 250px;
  }

  @media (min-width: 768px) {
    .ad-container {
      height: 300px;
    }
  }
</style>

<div id="responsive-ad" class="ad-container" data-slot-id="SLOT-RESPONSIVE"></div>
```

SDK автоматически определит размер контейнера.

---

## Лучшие практики

### 1. Размещение скрипта

**Рекомендуется:** В конце `<body>`

```html
<body>
  <!-- Контент -->
  <div data-slot-id="SLOT-ID"></div>

  <!-- SDK в конце -->
  <script src="sdk.min.js"></script>
</body>
```

**Альтернатива:** В `<head>` с `defer`

```html
<head>
  <script src="sdk.min.js" defer></script>
</head>
```

### 2. Стилизация контейнеров

```css
.ad-slot {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  overflow: hidden;
}

/* Центрирование */
.ad-slot .adserver-banner {
  margin: 0 auto;
}
```

### 3. Обработка ошибок

```javascript
window.AdServerSDKConfig = {
  onError: (error) => {
    // Логирование
    console.error('Ad error:', error);

    // Fallback действие
    showHouseAd();

    // Отправка в аналитику
    analytics.track('ad_error', {
      message: error.message
    });
  }
};
```

### 4. Lazy Loading

Для лучшей производительности используйте ленивую загрузку:

```html
<script
  src="sdk.min.js"
  data-lazy-load="true">
</script>
```

Или Intersection Observer:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const slotId = entry.target.dataset.slotId;
      renderBanner(slotId, entry.target);
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('[data-slot-id]').forEach(el => {
  observer.observe(el);
});
```

### 5. Аналитика

Интегрируйте с вашей аналитикой:

```javascript
sdk.on('banner-loaded', (data) => {
  // Google Analytics
  gtag('event', 'ad_loaded', {
    slot_id: data.slotID
  });

  // Яндекс.Метрика
  yaCounterXXXXXXXX.reachGoal('ad_loaded', {
    slot_id: data.slotID
  });
});

sdk.on('click', (data) => {
  gtag('event', 'ad_click', {
    slot_id: data.slotID
  });
});
```

---

## Безопасность

### Еслиrame Mode

Для изоляции рекламы используйте iframe-режим:

```html
<script
  src="sdk.min.js"
  data-iframe-mode="true">
</script>
```

Или программно:

```javascript
await renderBanner('SLOT-ID', container, {
  useIframe: true
});
```

### Content Security Policy

Добавьте в ваш CSP:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.adserver.com;
  img-src 'self' https://cdn.adserver.com https://*.adserver.com;
  frame-src 'self' https://*.adserver.com;
  connect-src 'self' https://api.adserver.com;
```

### Валидация размера

Ограничьте максимальный размер:

```css
.ad-slot {
  max-width: 300px;
  max-height: 250px;
  overflow: hidden;
}
```

---

## Производительность

### Кеширование

SDK кеширует баннеры в sessionStorage:

```javascript
// Настройка TTL кеша
window.AdServerSDKConfig = {
  cacheEnabled: true,
  cacheTTL: 300000 // 5 минут
};
```

### Предзагрузка

Предзагрузите SDK для критических путей:

```html
<link rel="preload" href="sdk.min.js" as="script">
```

### Оптимизация рендеринга

Используйте `requestIdleCallback` для низкоприоритетной отрисовки:

```javascript
function renderWhenIdle(slotId, container) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      renderBanner(slotId, container);
    });
  } else {
    renderBanner(slotId, container);
  }
}
```

### Мониторинг производительности

```javascript
import { getPerformanceMonitor } from '@adserver/web-sdk';

const monitor = getPerformanceMonitor();

// Проверка метрик
setInterval(() => {
  const metrics = monitor.getMetrics();
  if (metrics.averageLoadTime > 1000) {
    console.warn('Медленная загрузка рекламы');
  }
}, 60000);
```

---

## Поиск и устранение проблем

### Реклама не отображается

**Проверьте:**

1. Правильный ли Slot ID:
   ```javascript
   console.log(document.querySelector('[data-slot-id]')?.dataset.slotId);
   ```

2. Загрузился ли SDK:
   ```javascript
   console.log(window.adserver?.isInitialized());
   ```

3. Включите debug-режим:
   ```html
   <script src="sdk.min.js" data-debug="true"></script>
   ```

4. Проверьте консоль браузера на ошибки

### Ошибки сети

**Проверьте:**

1. Доступность API:
   ```javascript
   fetch('https://api.adserver.com/v1/health')
     .then(r => console.log('API OK'))
     .catch(e => console.error('API Error:', e));
   ```

2. Таймауты (увеличьте при медленном соединении):
   ```javascript
   window.AdServerSDKConfig = {
     apiTimeout: 10000
   };
   ```

3. Настройки retry:
   ```javascript
   window.AdServerSDKConfig = {
     retryEnabled: true,
     retryMaxAttempts: 5,
     retryDelay: 2000
   };
   ```

### Конфликты с другими скриптами

**Используйте iframe-режим:**
```html
<script data-iframe-mode="true" src="sdk.min.js"></script>
```

**Изолируйте CSS:**
```css
.ad-slot .adserver-banner {
  all: initial;
  font-family: Arial, sans-serif;
}
```

### Медленная загрузка страницы

**Проверьте:**

1. Используйте асинхронную загрузку:
   ```html
   <script src="sdk.min.js" async></script>
   ```

2. Включите lazy loading:
   ```html
   <script data-lazy-load="true" src="sdk.min.js"></script>
   ```

3. Отложите инициализацию:
   ```javascript
   window.addEventListener('load', () => {
     initSDK();
   });
   ```

### Получение диагностики

```javascript
// Информация о SDK
console.log(sdk.debug.info());

// Логи
console.log(sdk.debug.logs());

// Ошибки
console.log(sdk.debug.errors());

// Метрики производительности
import { getPerformanceMonitor } from '@adserver/web-sdk';
console.log(getPerformanceMonitor().getMetrics());
```

---

## FAQ

### В: Какие браузеры поддерживаются?

**О:** Современные браузеры:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### В: Нагружает ли SDK страницу?

**О:** Нет:
- Размер: ~15KB (gzip)
- Без зависимостей
- Lazy loading по умолчанию
- Кеширование запросов

### В: Как проверить работу SDK?

**О:** Включите debug-режим:
```html
<script data-debug="true" src="sdk.min.js"></script>
```

И проверьте консоль браузера.

### В: Можно ли использовать несколько SDK на одной странице?

**О:** Нет, используется Singleton. Один экземпляр обслуживает все слоты.

### В: Как интегрировать с SPA (React, Vue, Angular)?

**О:**

**React:**
```jsx
import { useEffect, useRef } from 'react';
import { renderBanner } from '@adserver/web-sdk';

function AdSlot({ slotId }) {
  const ref = useRef();

  useEffect(() => {
    renderBanner(slotId, ref.current);
  }, [slotId]);

  return <div ref={ref} />;
}
```

**Vue:**
```vue
<template>
  <div ref="adSlot"></div>
</template>

<script>
import { renderBanner } from '@adserver/web-sdk';

export default {
  props: ['slotId'],
  mounted() {
    renderBanner(this.slotId, this.$refs.adSlot);
  }
};
</script>
```

**Angular:**
```typescript
import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { renderBanner } from '@adserver/web-sdk';

@Component({
  selector: 'app-ad-slot',
  template: '<div #adSlot></div>'
})
export class AdSlotComponent implements AfterViewInit {
  @Input() slotId!: string;

  @ViewChild('adSlot', { static: true })
  adSlot!: ElementRef;

  ngAfterViewInit() {
    renderBanner(this.slotId, this.adSlot.nativeElement);
  }
}
```

### В: Как работать с адблокерами?

**О:**

1. Обнаружение адблокера:
```javascript
const isBlocked = typeof window.adserver === 'undefined';
if (isBlocked) {
  // Показать собственную рекламу
}
```

2. Fallback контент:
```javascript
window.AdServerSDKConfig = {
  fallbackEnabled: true
};
```

### В: Можно ли настроить собственный fallback?

**О:** Да:
```javascript
sdk.on('banner-error', (data) => {
  const container = document.querySelector(`[data-slot-id="${data.slotID}"]`);
  container.innerHTML = '<div>Партнерская реклама</div>';
});
```

### В: Как отслеживать показы и клики?

**О:** Используйте события:
```javascript
sdk.on('impression', (data) => {
  analytics.track('ad_impression', data);
});

sdk.on('click', (data) => {
  analytics.track('ad_click', data);
});
```

### В: Как протестировать интеграцию?

**О:** Используйте тестовый режим:
```html
<script data-test-mode="true" src="sdk.min.js"></script>
```

Или через конфиг:
```javascript
window.AdServerSDKConfig = {
  testMode: true,
  debug: true
};
```

---

## Полный пример

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Мой сайт с рекламой</title>

  <!-- Конфигурация SDK -->
  <script>
    window.AdServerSDKConfig = {
      apiEndpoint: 'https://api.adserver.com/v1',
      debug: false,
      cacheEnabled: true,
      cacheTTL: 300000,
      retryEnabled: true,
      retryMaxAttempts: 3,
      fallbackEnabled: true,
      onReady: () => {
        console.log('AdServer SDK готов к работе');
      },
      onError: (error) => {
        console.error('Ошибка AdServer:', error);
        // Отправить в систему мониторинга
        if (window.Sentry) {
          Sentry.captureException(error);
        }
      }
    };
  </script>

  <!-- Стили для рекламных мест -->
  <style>
    .ad-slot {
      display: block;
      width: 100%;
      max-width: 300px;
      height: 250px;
      margin: 20px auto;
      overflow: hidden;
    }

    @media (min-width: 768px) {
      .ad-slot {
        max-width: 728px;
        height: 90px;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Мой сайт</h1>
  </header>

  <main>
    <!-- Рекламное место 1 -->
    <div id="header-ad" class="ad-slot" data-slot-id="SLOT-HEADER-001"></div>

    <!-- Контент -->
    <article>
      <h2>Статья</h2>
      <p>Содержание статьи...</p>
    </article>

    <!-- Рекламное место 2 -->
    <div id="content-ad" class="ad-slot" data-slot-id="SLOT-CONTENT-001"></div>
  </main>

  <footer>
    <!-- Рекламное место 3 -->
    <div id="footer-ad" class="ad-slot" data-slot-id="SLOT-FOOTER-001"></div>
  </footer>

  <!-- Загрузка SDK -->
  <script
    src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"
    defer>
  </script>

  <!-- Аналитика (опционально) -->
  <script>
    // Подписка на события для аналитики
    window.addEventListener('load', () => {
      if (window.adserver) {
        window.adserver.on('banner-loaded', (data) => {
          // Google Analytics
          if (window.gtag) {
            gtag('event', 'ad_loaded', {
              slot_id: data.slotID
            });
          }
        });

        window.adserver.on('click', (data) => {
          if (window.gtag) {
            gtag('event', 'ad_click', {
              slot_id: data.slotID
            });
          }
        });
      }
    });
  </script>
</body>
</html>
```

---

## Поддержка

Нужна помощь? Свяжитесь с нами:

- Email: support@adserver.com
- Документация: https://docs.adserver.com
- GitHub: https://github.com/adserver/web-sdk/issues
- Telegram: @adserver_support

---

## Чек-лист интеграции

Перед запуском убедитесь:

- [ ] Получили Slot ID для каждого рекламного места
- [ ] Добавили контейнеры с `data-slot-id`
- [ ] Подключили SDK (CDN или NPM)
- [ ] Настроили конфигурацию (опционально)
- [ ] Проверили в debug-режиме
- [ ] Интегрировали аналитику (опционально)
- [ ] Протестировали на разных устройствах
- [ ] Проверили работу с адблокерами
- [ ] Настроили fallback контент
- [ ] Добавили обработку ошибок

---

**Версия:** 0.1.0
**Последнее обновление:** 2026-02-08
