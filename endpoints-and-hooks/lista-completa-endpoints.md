# 📋 Lista Completa de Endpoints para Teste

## Total: 108 Endpoints + 2 Webhooks = 110 Items

### NATIVOS (66 endpoints)

#### Message Controller (11 endpoints)
1. Enviar Texto
2. Enviar Status
3. Enviar Mídia
4. Enviar Áudio
5. Enviar Sticker
6. Enviar Localização
7. Enviar Contato
8. Enviar Reação
9. Enviar Enquete
10. Enviar Lista
11. Enviar Botões

#### Chat Controller (22 endpoints)
12. Verificar Números WhatsApp
13. Marcar como Lida
14. Marcar Chat como Não Lido
15. Arquivar Chat
16. Apagar Mensagem
17. Atualizar Mensagem
18. Enviar Presença
19. Status de Bloqueio
20. Buscar Foto de Perfil
21. Obter Base64 de Mídia
22. Buscar Contatos
23. Buscar Mensagens
24. Buscar Mensagens de Status
25. Buscar Chats
26. Buscar Perfil Comercial
27. Buscar Perfil
28. Atualizar Nome do Perfil
29. Atualizar Status do Perfil
30. Atualizar Foto do Perfil
31. Remover Foto do Perfil
32. Buscar Configurações de Privacidade
33. Atualizar Configurações de Privacidade

#### Group Controller (15 endpoints)
34. Criar Grupo
35. Atualizar Foto do Grupo
36. Atualizar Assunto do Grupo
37. Atualizar Descrição do Grupo
38. Obter Código de Convite
39. Revogar Código de Convite
40. Enviar Convite
41. Informações do Convite
42. Buscar Informações do Grupo
43. Buscar Todos os Grupos
44. Listar Participantes
45. Atualizar Participante
46. Atualizar Configurações
47. Ativar/Desativar Mensagens Temporárias
48. Sair do Grupo

#### Evolution Bot (8 endpoints)
49. Criar Bot
50. Buscar Bot
51. Buscar Bot Específico
52. Atualizar Bot
53. Deletar Bot
54. Configurações do Bot
55. Buscar Configurações
56. Alterar Status
57. Buscar Sessões

#### API Status (1 endpoint)
58. Status da API

#### Settings Controller (2 endpoints)
59. Configurar Instância
60. Buscar Configurações

#### Websocket (2 endpoints)
61. Configurar Websocket
62. Buscar Configurações Websocket

#### Integrações (4 endpoints)
63. Configurar SQS
64. Buscar Configurações SQS
65. Configurar RabbitMQ
66. Buscar Configurações RabbitMQ

### CUSTOM (42 endpoints)

#### Instance Management - Basic (8 endpoints)
67. Criar Instância
68. Listar Instâncias
69. Conectar Instância
70. Reiniciar Instância
71. Estado da Conexão
72. Logout da Instância
73. Deletar Instância
74. Definir Presença

#### Instance Management - Advanced (8 endpoints)
75. Consultar Filtros
76. Atualizar Filtros
77. Consultar Filtros de Áudio
78. Atualizar Filtros de Áudio
79. Estatísticas de Filtros de Áudio
80. Resetar Estatísticas de Áudio
81. Duplicar Instância
82. Métricas da Instância

#### Global Queue System (3 endpoints)
83. Estatísticas da Fila
84. Métricas da Fila
85. Resetar Métricas da Fila

#### Dual Webhook System - Health (2 endpoints)
86. Saúde dos Webhooks
87. Métricas dos Webhooks

#### Dual Webhook System - Logs (3 endpoints)
88. Consultar Logs
89. Exportar Logs
90. Limpar Logs

#### Dual Webhook System - Retry (3 endpoints)
91. Listar Falhas
92. Remover Falha Específica
93. Limpar Todas as Falhas

#### Dual Webhook System - Testing (1 endpoint)
94. Testar Webhook

#### Global Webhook Configuration (4 endpoints)
95. Consultar Configuração Global
96. Criar/Atualizar Configuração Global
97. Desabilitar Configuração Global
98. Testar Configuração Global

#### Processing Feedback System (4 endpoints)
99. Iniciar Processamento
100. Finalizar Processamento
101. Status do Processamento
102. Limpar Sessão

#### S3 Cleanup System (4 endpoints)
103. Consultar Agendamento
104. Atualizar Agendamento
105. Executar Cleanup Manual
106. Status do Cleanup

### WEBHOOKS (2 items)
107. Webhook Principal
108. Webhook Monitoramento

## Resumo por Prioridade

### FASE 1 - Básicos (3 endpoints)
- Status da API
- Listar Instâncias
- Estado da Conexão

### FASE 2 - Nativos (63 endpoints restantes)
- Message Controller: 11 endpoints
- Chat Controller: 22 endpoints
- Group Controller: 15 endpoints
- Evolution Bot: 8 endpoints
- Settings Controller: 2 endpoints
- Websocket: 2 endpoints
- Integrações: 4 endpoints

### FASE 3 - Custom (42 endpoints)
- TODOS os endpoints custom sem exceção

### FASE 4 - Webhooks (2 items)
- Webhook Principal
- Webhook Monitoramento