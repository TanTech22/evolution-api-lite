# # Prompt para execução dos testes em diferentes sessões do Claude

Quero passar por todos os testes listados em @endpoints-and-hooks/testes-endpoints/CHECKLIST-MASTER.md de maneira progressiva e a partir do último teste realizado. Ao final de cada teste quero ver o resultado. Se eu estiver satisfeito, eu mesmo tico o teste como verificado. Veja se entendeu a tarefa antes de iniciarmos. Pode ler também @endpoints-and-hooks/testes-endpoints/README.md @endpoints-and-hooks/testes-endpoints/INSTRUÇÕES-DE-USO.md e @endpoints-and-hooks/testes-endpoints/plano-de-acao.md para compreender melhor a tarefa.


Exemplo de resposta inicial:

Entendi perfeitamente a tarefa! Você quer executar todos os 110 testes listados no CHECKLIST-MASTER.md de forma progressiva, começando do ponto onde parou.

  📋 Resumo da Situação:

  - Total: 110 endpoints para testar (108 endpoints + 2 webhooks)
  - Status atual: 0/110 testados (0%)
  - Servidor: http://195.35.17.156:8080
  - API Key: BQYHJGJHJ
  - Instância de teste: 5511930670388

  🎯 Plano de Execução:

  FASE 1: Testes Básicos (3 endpoints - ZERO risco)
  - T001: GET / - Status da API
  - T002: GET /instance/fetchInstances - Listar Instâncias
  - T003: GET /instance/5511930670388/connectionState - Estado da Conexão

  FASE 2: Endpoints Nativos (66 endpoints)
  - Settings, Messages, Chat, Group, Bot, Websocket, Integrações

  FASE 3: Endpoints Custom (42 endpoints)
  - Instance Management, Queue System, Webhooks, S3 Cleanup

  FASE 4: Webhooks (2 items)
  - Teste de webhooks principal e monitoramento

  🚀 Metodologia:

  1. Executar cada teste individualmente
  2. Mostrar o resultado completo (request + response)
  3. Aguardar sua confirmação para marcar como ✅
  4. Atualizar o progresso no checklist
  5. Prosseguir para o próximo teste

  Vou começar pela FASE 1 com os 3 testes básicos de ZERO risco. A cada teste, mostrarei:
  - O comando curl executado
  - A resposta completa
  - O status HTTP
  - Aguardarei sua confirmação para continuar

  Posso começar com o T001 - Status da API?
