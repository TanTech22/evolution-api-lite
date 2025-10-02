2. Configurar o Arquivo .env para Produção

  Crie um arquivo .env.production baseado no template:

  # ========================================
  # CONFIGURAÇÃO PARA PRODUÇÃO COM S3
  # ========================================

  # === S3/MINIO (Habilitado para produção) ===
  S3_ENABLED=true
  S3_ENDPOINT=localhost                         # Se MinIO estiver no mesmo host
  S3_PORT=9000
  S3_USE_SSL=false
  S3_ACCESS_KEY=evolution
  S3_SECRET_KEY=evolution123
  S3_BUCKET=evolution
  S3_REGION=us-east-1

  # === S3 CONFIGURAÇÕES AVANÇADAS ===
  S3_AUDIO_URL_EXPIRY=3600
  S3_CLEANUP_ENABLED=true
  S3_CLEANUP_DAYS=7

  # === SERVIDOR ===
  SERVER_TYPE=http
  SERVER_PORT=8080
  SERVER_URL=http://your-domain.com:8080

  # === BANCO DE DADOS ===
  DATABASE_PROVIDER=postgresql
  DATABASE_CONNECTION_URI=postgresql://user:pass@localhost:5432/evolution

  # === CACHE ===
  CACHE_REDIS_ENABLED=true
  CACHE_REDIS_URI=redis://localhost:6379
  CACHE_LOCAL_ENABLED=false

  # === AUTENTICAÇÃO ===
  AUTHENTICATION_API_KEY_ENABLED=true
  AUTHENTICATION_API_KEY_KEY=YOUR-SECURE-API-KEY

  # === CORS ===
  CORS_ORIGIN=*
  CORS_METHODS=POST,GET,PUT,DELETE
  CORS_CREDENTIALS=true

  # === SALVAR DADOS ===
  DATABASE_SAVE_DATA_INSTANCE=true
  DATABASE_SAVE_DATA_NEW_MESSAGE=true
  DATABASE_SAVE_MESSAGE_UPDATE=true
  DATABASE_SAVE_DATA_CONTACTS=true
  DATABASE_SAVE_DATA_CHATS=true
  DATABASE_SAVE_DATA_LABELS=true
  DATABASE_SAVE_DATA_HISTORIC=false
  DATABASE_SAVE_IS_ON_WHATSAPP=true
  DATABASE_SAVE_IS_ON_WHATSAPP_DAYS=7

  # === LOGS ===
  LOG_LEVEL=ERROR,WARN,DEBUG,INFO,LOG
  LOG_COLOR=false
  LOG_BAILEYS=error

  # === WEBHOOK GLOBAL ===
  WEBHOOK_GLOBAL_ENABLED=false
  WEBHOOK_GLOBAL_URL=
  WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false

  # === OUTROS SERVIÇOS ===
  RABBITMQ_ENABLED=false
  SQS_ENABLED=false
  PUSHER_ENABLED=false
  WEBSOCKET_ENABLED=true
  TYPEBOT_ENABLED=false
  CHATWOOT_ENABLED=false
  PROXY_GLOBAL_ENABLED=false

  # === FILA GLOBAL ===
  GLOBAL_QUEUE_ENABLED=true
  GLOBAL_QUEUE_RATE_LIMIT=500
  GLOBAL_QUEUE_RATE_INTERVAL=60000

  # === TOKEN BUCKET ===
  TOKEN_BUCKET_CAPACITY=500
  TOKEN_BUCKET_REFILL_RATE=500
  TOKEN_BUCKET_REFILL_INTERVAL=60000

  # === FILTROS DE ÁUDIO ===
  AUDIO_FILTER_ENABLED=true
  AUDIO_FILTER_MIN_DURATION=1
  AUDIO_FILTER_MAX_DURATION=7200
  AUDIO_FILTER_REPLY_TO_OVERSIZE=true
  AUDIO_FILTER_OVERSIZE_REACTION=⸘
  AUDIO_FILTER_OVERSIZE_MESSAGE=Áudio acima do limite de 2 horas

  # === QRCODE ===
  QRCODE_LIMIT=10
  QRCODE_COLOR=#198754

  # === WEBHOOK MONITORAMENTO ===
  WEBHOOK_MONITORING_URL=
  WEBHOOK_MONITORING_ENABLED=false

  3. Docker Compose para Teste Completo

  Crie um docker-compose.yml para testar tudo junto:

  version: '3.8'

  services:
    minio:
      image: minio/minio
      container_name: evolution-minio
      ports:
        - "9000:9000"
        - "9001:9001"
      environment:
        MINIO_ROOT_USER: evolution
        MINIO_ROOT_PASSWORD: evolution123
      volumes:
        - minio_data:/data
      command: server /data --console-address ":9001"
      networks:
        - evolution-network

    postgres:
      image: postgres:15
      container_name: evolution-postgres
      environment:
        POSTGRES_USER: evolution
        POSTGRES_PASSWORD: evolution123
        POSTGRES_DB: evolution
      volumes:
        - postgres_data:/var/lib/postgresql/data
      ports:
        - "5432:5432"
      networks:
        - evolution-network

    redis:
      image: redis:7-alpine
      container_name: evolution-redis
      ports:
        - "6379:6379"
      networks:
        - evolution-network

    evolution-api:
      build: .
      container_name: evolution-api
      ports:
        - "8080:8080"
      env_file:
        - .env.production
      depends_on:
        - minio
        - postgres
        - redis
      networks:
        - evolution-network
      environment:
        # Override para conectar aos serviços do Docker
        S3_ENDPOINT: minio
        DATABASE_CONNECTION_URI: postgresql://evolution:evolution123@postgres:5432/evolution
        CACHE_REDIS_URI: redis://redis:6379

  volumes:
    minio_data:
    postgres_data:

  networks:
    evolution-network:
      driver: bridge

  4. Processo de Deploy

  # 1. Subir apenas o MinIO primeiro (para criar bucket)
  docker-compose up -d minio postgres redis

  # 2. Aguardar serviços ficarem prontos
  sleep 10

  # 3. Subir a Evolution API
  docker-compose up -d evolution-api

  # 4. Verificar logs
  docker-compose logs -f evolution-api

  5. Verificação S3

  Acesse o console MinIO em http://localhost:9001:
  - Usuário: evolution
  - Senha: evolution123

  Você deve ver o bucket evolution criado automaticamente.

  6. Teste Simples

  Para testar se está funcionando, você pode verificar os logs da aplicação:

  docker-compose logs evolution-api | grep "S3 Bucket"

  Deve aparecer: S3 Bucket evolution - ON

  Resumo dos Passos:

  1. MinIO rodando (Docker ou standalone)
  2. Arquivo .env.production configurado
  3. Docker Compose (opcional, mas recomendado)
  4. Deploy com docker-compose up
  5. Verificação nos logs e console MinIO

● A diferença fundamental é que agora você só precisa mudar uma variável: S3_ENABLED=true no arquivo .env.production e tudo funcionará automaticamente! 🚀