# AdServer Web SDK - Документация

Добро пожаловать в документацию AdServer Web SDK версии 0.1.0.

## Документы

### [API Documentation](./api.md)
Полная справка по API SDK, включая все функции, классы, типы и интерфейсы. Подходит для разработчиков, которым нужны подробные технические детали.

### [Integration Guide](./integration.md)
Пошаговое руководство по интеграции SDK на ваш сайт. Начните здесь, если вы впервые работаете с AdServer Web SDK.

## Быстрый старт

Для быстрой интеграции выполните следующие шаги:

1. **Получите Slot ID** на https://adserver.com

2. **Добавьте контейнер** на вашу страницу:
   ```html
   <div id="ad-banner" data-slot-id="ВАШ-SLOT-ID"></div>
   ```

3. **Подключите SDK**:
   ```html
   <script src="https://cdn.adserver.com/sdk/v0.1.0/sdk.min.js"></script>
   ```

4. **Готово!** SDK автоматически отобразит рекламу.

Подробнее в [Integration Guide](./integration.md).

## Возможности

- Легковесный (~15KB gzip)
- Никаких зависимостей
- Автоматическая загрузка баннеров
- Кеширование в sessionStorage
- Retry-логика с экспоненциальной задержкой
- Поддержка iframe и direct injection
- Fallback контент при ошибках
- Полная поддержка TypeScript
- События для аналитики

## Поддерживаемые браузеры

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Получение помощи

- Email: support@adserver.com
- Документация: https://docs.adserver.com
- GitHub Issues: https://github.com/adserver/web-sdk/issues
- Telegram: @adserver_support

## Лицензия

MIT License - см. LICENSE в корневом каталоге репозитория.
