# **¿Que es este proyecto?**

El presente proyecto es una página de reservas de espacios, dicha pagina fue hecha con Vite + React, junto a TypeScript y JavaScript.

# Motivacion detras de este proyecto-

El propósito bajo el cual se creó este proyecto fue con el fin de aprender a programar tanto frontend como backend en el framework React, por lo que este proyecto está orientado a ser ejecutado de forma local y no sobre el internet. Aunque con algunos cambios y el despliegue del backend se podría desplegar esta página en la web, este no era el objetivo final del proyecto, por lo que no se realizó.

## Cómo ejecutar este proyecto

Sigue estos pasos para ejecutar la aplicación localmente:

1. Tener PostgreSQL y Node.js instalados en la máquina.
2. Crear una base de datos en PostgreSQL.
3. Copiar `backend/.env.example` y renombrarlo a `backend/.dev.env`, luego configurar los datos de conexión a la base de datos dentro de ese archivo.

4. Abrir una terminal y ejecutar:

```bash
cd backend && npm i
```

5. Iniciar el backend:

```bash
npm run start
```

6. Ejecutar los seeders para poblar datos iniciales (desde la carpeta `backend`):

```bash
npm run seed:espacios && npm run seed:material
```

7. En otra terminal, preparar e iniciar el frontend:

```bash
cd frontend && npm i
npm run dev
```

## Tests

-   Para ejecutar los tests del backend (desde la carpeta `backend`):

```bash
npm run test
```

-   Para ejecutar los tests del frontend (desde la carpeta `frontend`):

```bash
npm run test:ui
```
