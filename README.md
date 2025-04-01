# Conexa Challenge

## Requerimientos

`node`
`npm`
`docker`
`docker-compose`

## Uso

**Clonar repositorio**

```bash
git clone https://github.com/adriancolunga1/conexa-challenge.git
```

**Desplegar**

```bash
docker compose up -d
```

## Aclaraciones

PostgreSQL como base de datos utilizada. Accesos disponibles en el .env
```bash
DB=challenge
DB_HOST=database
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1234
```

El endpoint `/auth/login` devuelve un access token válido por 15 min y un refresh token por 7 días. Variables modificables en el .env

```bash
ACCESSTOKEN_EXPIRATION
REFRESHTOKEN_EXPIRATION
```

`/movies/syncronize` se ejecutará automáticamente al iniciar el servidor y cada media hora por el cron. Guardará y devolverá nuevos registros en caso de que no existan. También está disponible como endpoint en caso de querer utilizarlo.

## Adicionales

Se agregó de forma adicional:

`Refresh token` El endpoint /auth/refresh al cual se accede con el refresh token facilitado en la respuesta de /auth/login y devuelve un nuevo access token.

`Manejo de excepciones globales` Cacheo de errores a nivel global. La respuesta será similar a:

```bash
{
  "status": 401,
  "message": "Unauthorized",
  "path": "/movies",
  "method": "POST",
  "level": "error",
  "timestamp": "30-03-2025 21:17:23"
}
```

`Middleware Logger` Se agregó Winstom como logger, el mismo crea la carpeta `logs` en el root en donde se dispone de los archivos info.log y errors.log, también loggeará información sobre la petición actual similar a:

```bash
{
  "level":"info",
  "message":{"action":201,"data":{"body":{"username":"pi772"},"params":{},"query":{}},
  "method":"POST",
  "route":"/auth/login",
  "timestamp":"30-03-2025 21:26:40"
  }
```

## Tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Documentación API

[Swagger](http://localhost:3000/api)
