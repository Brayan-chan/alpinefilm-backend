# AlpineFilm Backend

API privada de catálogo, subida resumible y streaming para Alpine Linux, Node.js 24 y equipos de recursos limitados.

## Desarrollo

```bash
cp .env.example .env
npm install
npm run admin:create -- brayan 'una-contraseña-segura' 'Brayan'
npm run dev
```

Prueba desde otro dispositivo del tailnet:

```bash
curl http://100.98.115.100:3000/api/v1/health
```

Para escuchar directamente en Tailscale durante desarrollo, cambia `HOST=0.0.0.0`. La opción final recomendada es conservar `HOST=127.0.0.1` y publicar de forma privada con `tailscale serve --bg 3000`.

## Producción en Alpine

```sh
apk add nodejs npm ffmpeg
mkdir -p /opt/alpinefilm
cd /opt/alpinefilm
git clone https://github.com/Brayan-chan/alpinefilm-backend.git backend
cd backend
cp .env.example .env
nano .env
sh deploy/install.sh
npm run admin:create -- brayan 'CONTRASEÑA' 'Brayan'
rc-service alpinefilm start
```

Usa secretos diferentes de al menos 32 caracteres. El servicio no debe ejecutarse como root.

## Flujo de subida

1. Crear una película con `POST /api/v1/admin/movies`.
2. Crear subida con `POST /api/v1/admin/uploads`.
3. Consultar offset con `HEAD /api/v1/admin/uploads/:id`.
4. Enviar fragmentos de hasta 8 MiB con `PATCH`, `Upload-Offset` y `Content-Length`.
5. Finalizar con `POST /api/v1/admin/uploads/:id/complete`.
6. Publicar con `POST /api/v1/admin/movies/:id/publish`.
7. Pedir un token mediante `POST /api/v1/movies/:id/playback-token`.
8. Reproducir la URL temporal con `expo-video`.

Multer usa exclusivamente almacenamiento en disco para portadas. Los videos pasan directamente del request al HDD mediante streams y backpressure.

## Endpoints implementados

- `GET /api/v1/health`
- `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `GET|POST /api/v1/admin/users`
- `GET /api/v1/movies`, `GET /api/v1/movies/:id`
- `POST|PATCH /api/v1/admin/movies`
- publicar, ocultar y subir portada
- iniciar, consultar, enviar y completar uploads resumibles
- token temporal y streaming HTTP Range
- progreso y favoritos

## Verificación

```bash
npm test
npm run build
```
