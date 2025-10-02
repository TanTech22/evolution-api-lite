 - Evolution API usa MinIO/S3, mas como serviço externo
  - MinIO é um servidor de armazenamento separado (como se fosse AWS S3)
  - A API se conecta ao MinIO, não o inclui

  Vou te dar duas opções mais práticas:

  Opção 1: MinIO no mesmo container (Mais próximo do que você pensava)

  # No seu Dockerfile da Evolution API, adicione MinIO
  FROM node:18-alpine
  # ... suas configurações normais da API ...

  # Instalar MinIO no mesmo container
  RUN wget https://dl.min.io/server/minio/release/linux-amd64/minio && \
      chmod +x minio && \
      mv minio /usr/local/bin/

  # Script de inicialização que sobe MinIO e a API
  COPY start.sh /start.sh
  CMD ["/start.sh"]

  # start.sh
  #!/bin/bash
  # Subir MinIO em background
  minio server /data --address ":9000" --console-address ":9001" &

  # Subir Evolution API
  npm start

  Opção 2: Docker Compose Simplificado (Recomendado)

  # docker-compose.yml - Uma linha resolve tudo
  version: '3.8'
  services:
    evolution-stack:
      build: .
      ports:
        - "8080:8080"
      environment:
        S3_ENABLED: true
        # ... outras envs
      depends_on:
        - minio

    minio:
      image: minio/minio:latest
      ports: ["9000:9000", "9001:9001"]
      environment:
        MINIO_ROOT_USER: evolution
        MINIO_ROOT_PASSWORD: evolution123
      command: server /data --console-address ":9001"

  Para Docker Swarm (ainda mais simples):

  # stack.yml
  version: '3.8'
  services:
    minio:
      image: minio/minio
      environment:
        MINIO_ROOT_USER: evolution
        MINIO_ROOT_PASSWORD: evolution123
      command: server /data --console-address ":9001"

    evolution:
      image: sua-evolution-api
      environment:
        S3_ENABLED: "true"
        S3_ENDPOINT: minio
        S3_ACCESS_KEY: evolution
        S3_SECRET_KEY: evolution123
      depends_on:
        - minio

  Deploy: docker stack deploy -c stack.yml evolution

  Resumo da confusão:

  - Você: "Achei que era só subir a API" ✅ (Faz sentido!)
  - Realidade: MinIO é um servidor separado (como Redis, PostgreSQL)
  - Solução: Um docker-compose com 2 serviços resolve tudo

  A confusão foi natural! MinIO parece que deveria ser built-in, mas é um serviço de storage independente. 🎯