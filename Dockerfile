# Ratary Server — production image (Phase 27)
# Runtime uses tsx until build:local compiles a standalone dist bundle.
FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system ratary && useradd --system --gid ratary ratary

COPY package.json package-lock.json ./
COPY packages ./packages
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm ci && chown -R ratary:ratary /app

USER ratary

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npx", "tsx", "src/index.ts"]
