# LibreTutor.org

## Español

LibreTutor es un proyecto personal. Lo hago porque quiero que los chicos aprendan jugando, empezando por un mapa 3D para explorar.

Panamá es el primer destino; la idea es que el mapa crezca.

Qué hay aquí:

- `dist/mapa/`: el mapa 3D, ya compilado.
- `dist/privacidad/`: qué datos usa el sitio (ninguno sale de tu navegador).
- `server.mjs`: un servidor pequeño en Node, sin dependencias, que sirve esas dos páginas.

Para correrlo en tu máquina (Node 22 o más nuevo):

```bash
node server.mjs        # http://127.0.0.1:8080/
npm test
```

Es software libre bajo la licencia GPLv3 (ver `LICENSE.md`). Si te sirve, úsalo, y si lo cambias y lo compartes, comparte también tus cambios. Si encuentras algo roto, abre un issue.

— Nodier Torres, © 2026

## English

LibreTutor is a personal project. I build it because I want kids to learn by playing, starting with a 3D map to explore.

Panama is the first destination; the idea is for the map to grow.

What is here:

- `dist/mapa/`: the 3D map, already built.
- `dist/privacidad/`: what data the site uses (none leaves your browser).
- `server.mjs`: a small Node server with no dependencies that serves those two pages.

To run it on your machine (Node 22 or newer):

```bash
node server.mjs        # http://127.0.0.1:8080/
npm test
```

It is free software under the GPLv3 licence (see `LICENSE.md`). If it helps you, use it, and if you change it and share it, share your changes too. If you find something broken, open an issue.

— Nodier Torres, © 2026
