# Frontend export

Эта папка подготовлена для передачи фронтенда.

Включено:
- src/
- public/
- package.json и package-lock.json
- next.config.ts
- tsconfig.json
- next-env.d.ts
- eslint.config.mjs
- README.md
- .gitignore

Сознательно НЕ включено:
- node_modules/
- .next/
- .git/
- .vscode/
- .env, .env.local
- prisma/ (схема и локальная БД)
- Dockerfile и прочие инфраструктурные файлы

Если нужно отправить архивом:
PowerShell: Compress-Archive -Path .\* -DestinationPath ..\frontend_for_backend.zip
(запускать из этой папки)
