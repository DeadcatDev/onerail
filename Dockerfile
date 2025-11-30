FROM node:22 AS base
WORKDIR /usr/local/app

FROM base AS client-base
COPY client/package.json client/package-lock.json ./
RUN npm install
COPY client/.eslintrc.cjs client/index.html client/vite.config.js ./
COPY client/public ./public
COPY client/src ./src

FROM client-base AS client-dev
CMD ["npm", "run", "dev"]

FROM client-base AS client-build
RUN npm run build

FROM base AS backend-dev
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/tsconfig.json ./
COPY backend/spec ./spec
COPY backend/src ./src
CMD ["npm", "run", "dev"]

FROM backend-dev AS test
RUN npm run test


FROM backend-dev AS backend-build
RUN npm run build

FROM base AS final
ENV NODE_ENV=production
COPY --from=test /usr/local/app/package.json /usr/local/app/package-lock.json ./
RUN npm ci --production && \
    npm cache clean --force
COPY --from=backend-build /usr/local/app/dist ./dist
COPY --from=client-build /usr/local/app/dist ./dist/static
EXPOSE 3000
CMD ["node", "dist/index.js"]