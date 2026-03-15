#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('${POSTGRES_HOST:-db}', ${POSTGRES_PORT:-5432}))
    s.close()
    exit(0)
except Exception:
    exit(1)
" 2>/dev/null; do
    sleep 1
done
echo "PostgreSQL is ready!"

# Если мы передали команду при запуске контейнера (например, 'docker-compose run backend bash')
# Переменная $# (кол-во переданных аргументов) будет больше 0.
if [ $# -gt 0 ]; then
    echo "Executing custom command: $@"
    # Заменяет текущий shell на переданную команду
    exec "$@"
else
    # Если аргументы не переданы, выполняем стандартный запуск бэкенда
    echo "Applying migrations..."
    python manage.py migrate --noinput
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
    echo "Creating superuser..."
    python manage.py createsuperuser --noinput || true
    echo "Starting server..."
    exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2
fi
