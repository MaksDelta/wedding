# Сайт-запрошення на весілля 🤍

Статичний односторінковий сайт (HTML + CSS + JS, без збірки) з анімаціями,
зворотним відліком, розкладом дня, картою, галереєю та RSVP.

## Як подивитися локально

Просто відкрийте `index.html` у браузері подвійним кліком.
(Карта та шрифти потребують інтернету.)

## Що замінити на своє

Усі місця для редагування позначені коментарем `✏️ ЗАМІНІТЬ`.

| Що | Де |
|----|----|
| Імена, дата, місто | `index.html` (hero, футер) |
| **Дата й час відліку** | `js/main.js` → `WEDDING_DATE` |
| Історія пари | `index.html` → секція `#story` |
| Розклад дня | `index.html` → секція `#schedule` |
| Назва/адреса локації | `index.html` → секція `#location` |
| Карта | `index.html` → `<iframe>` (Google Maps → «Поділитись» → «Вбудувати карту» → скопіюйте `src`) |
| Фото | покладіть свої у `assets/` і змініть `src` у секції `#gallery` |
| RSVP-форма | `index.html` → посилання на вашу [Google Forms](https://forms.google.com) |
| Кольори | `css/styles.css` → блок `:root` (змінна `--accent` тощо) |

### RSVP через Google Forms
1. Створіть форму на [forms.google.com](https://forms.google.com) (напр. поля: Імʼя, Буду / Не зможу, Кількість гостей).
2. **Надіслати → значок посилання 🔗 → скопіювати URL.**
3. Вставте URL у `href` кнопки в секції `#rsvp`.
4. *(Необовʼязково)* Можна вбудувати форму прямо на сторінку через `<iframe>` — код дає Google у «Надіслати → `< >`».

## Публікація на GitHub Pages

1. Створіть репозиторій на GitHub (напр. `wedding`).
2. Залийте код:
   ```bash
   git add .
   git commit -m "Wedding invitation site"
   git branch -M main
   git remote add origin https://github.com/ВАШ-ЛОГІН/wedding.git
   git push -u origin main
   ```
3. У репозиторії: **Settings → Pages → Build and deployment → Source: _Deploy from a branch_ → Branch: `main` / `root` → Save.**
4. За хвилину сайт буде доступний за адресою:
   `https://ВАШ-ЛОГІН.github.io/wedding/`

Готово — цим посиланням можна ділитися з гостями. 🎉

> Хочете гарну коротку адресу (напр. `наталія-та-іван.com`)? Можна купити домен
> і привʼязати його в **Settings → Pages → Custom domain**.
