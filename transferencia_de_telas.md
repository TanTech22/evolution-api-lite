● 🎯 O que precisa ser feito para transferir as telas:

  📂 Telas identificadas no Evolution API:

  - dashboard.html - Dashboard principal de instâncias
  - qr-screen.html - Tela de QR Code para conexão
  - simple-test.html - Tela de testes simples
  - test-qr.html - Teste de QR Code
  - images/ - Pasta com assets (logos, QR codes, etc.)

  📋 Endpoints da API utilizados pelas telas:

  // Principais endpoints encontrados:
  /instance/fetchInstances          // Lista todas instâncias
  /instance/connect/${instanceName} // Conecta instância + QR
  /instance/metrics/${instanceName} // Métricas da instância
  /instance/filters/${instanceName} // Filtros da instância (novo)

  ⚙️ O que precisa ser feito:

  1️⃣ Criar projeto externo

  # Estrutura sugerida:
  evolution-dashboard/
  ├── index.html (dashboard)
  ├── qr-code.html
  ├── assets/
  │   ├── images/
  │   ├── css/
  │   └── js/
  ├── config/
  │   └── api.js
  └── package.json (se usar servidor Node)

  2️⃣ Configurar comunicação com API

  // config/api.js
  const API_CONFIG = {
    baseURL: 'https://sua-evolution-api.com', // URL da sua API
    apiKey: 'sua-api-key',                    // API Key
    timeout: 30000
  };

  3️⃣ Ajustar código das telas

  - Trocar URLs relativas (/instance/) por absolutas
  - Adicionar autenticação nas requests
  - Configurar CORS se necessário

  4️⃣ Configurar CORS na Evolution API

  - Permitir origem do servidor externo
  - Configurar headers de autenticação

  5️⃣ Deploy do servidor externo

  - Nginx/Apache ou servidor Node.js
  - SSL/HTTPS configurado
  - Assets otimizados


● ✅ Transferência das Telas Concluída

  Criei uma estrutura completa para transferir suas telas públicas para um servidor externo. Aqui está o resumo do que foi implementado:

  📁 Estrutura Criada:

  - /root/evolution-external-ui/ - Projeto externo completo
  - Arquivos HTML transferidos e configurados
  - Assets e imagens copiados
  - Configuração JavaScript para API externa

  🔧 Configurações Implementadas:

  1. CORS automático via Nginx
  2. Headers de autenticação automáticos
  3. URLs dinâmicas (localhost vs produção)
  4. 3 opções de deploy: HTTP simples, Nginx, Docker

  🚀 Como usar:

  # 1. Desenvolvimento (já rodando na porta 3001)
  cd /root/evolution-external-ui
  python3 -m http.server 3001

  # 2. Acesse as telas:
  # http://localhost:3001/dashboard.html
  # http://localhost:3001/qr-screen.html

  ⚡ Economia Real de Recursos:

  Antes: Evolution API serve arquivos estáticos + lógica de negócio
  Depois: Evolution API apenas processa WhatsApp + APIs

  Economia estimada:
  - RAM: ~5-10MB
  - CPU: Redução no processamento de assets
  - Escalabilidade: UI pode usar CDN/cache externo

  🎯 Próximos Passos (Opcionais):

  1. Configurar domínio próprio para as telas
  2. Implementar CDN para assets
  3. Desabilitar express.static() na Evolution API (main.ts:61)
  4. Monitorar economia de recursos

  Servidor externo funcionando em: http://localhost:3001/dashboard.html ✅