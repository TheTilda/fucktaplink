# Генератор мобильных мини-лендингов (Astro + Tailwind)

Сверхлёгкий шаблон для статических «прокладок» под товары маркетплейсов. SSG, минимальный JS, mobile-first.

## Что внутри
- Astro 5 (App Router, SSG)
- TailwindCSS без сторонних UI-библиотек
- Компоненты: `ProductPage.astro`, `StatsCards.astro`, `MarketplaceButton.astro`
- Данные: `src/data/products.json` + маппинг к ассетам в `src/data/products.ts`
- Демо страница: `/soocas-d3-pro/` (данные из JSON)

## Старт
```bash
npm install
npm run dev   # http://localhost:4321
npm run build # статический билд в dist/
```

## Структура
```
src/
  assets/          # изображения товаров (используются Astro Image)
  components/      # UI-блоки лендинга
  data/            # products.json + products.ts (маппинг данных и ассетов)
  layouts/         # BaseLayout с мета-тегами
  pages/
    [slug].astro   # генерация лендингов по slug из JSON
    index.astro    # список доступных лендингов
```

## Как добавить новый товар
1) Положите картинку в `src/assets/` (желательно WebP/PNG/SVG, имя файла уникально).
2) Откройте `/admin` в dev-сервере, заполните форму.
3) Нажмите:
   - «Скачать products.json» — получаете обновлённый файл (без ручного копирования);
   - или «Сохранить в папку проекта (эксперимент)» — через File System Access API (Chrome) сохранит `src/data/products.json` и выбранное изображение в `src/assets/`.
4) Если сохраняете вручную, структура записи:
```json
{
  "slug": "new-product-slug",
  "title": "Название товара",
  "description": "Краткое описание до ~200 символов...",
  "image": "new-image.webp",
  "rating": 4.9,
  "reviews": 1200,
  "purchases": 15000,
  "links": {
    "wb": "https://www.wildberries.ru/...",
    "ozon": "https://www.ozon.ru/...",
    "ym": "https://market.yandex.ru/..."
  }
}
```
5) Готово: при билде Astro страница `/new-product-slug/` появится автоматически.

### Альтернатива через пропсы
`ProductPage.astro` может принимать объект `product` напрямую. Можно собрать отдельную страницу и передать данные пропсами, минуя JSON.

## Производительность и SEO
- SSG по умолчанию (`output: 'static'`)
- Герой-картинка: Astro Image с `loading="eager"` и `fetchpriority="high"` + `<link rel="preload">`
- Остальные картинки по умолчанию будут `lazy`
- Title/description/OG мета формируются в `BaseLayout.astro`
- Tailwind utility-only, без сторонних UI-фреймворков или тяжёлых зависимостей

## Советы по скорости
- Держите hero ≤ 1200px по длинной стороне, WebP/SVG предпочтительнее
- Избегайте внешних шрифтов, используйте системные (уже настроено)
- Не добавляйте лишний JS: текущие страницы полностью статичны
