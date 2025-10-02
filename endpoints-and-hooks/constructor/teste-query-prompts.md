# 🧪 Lista de Prompts para Teste do Constructor

## 📋 Objetivo

Esta lista contém prompts categorizados para testar todas as possíveis respostas do Evolution API Constructor, garantindo cobertura completa das funcionalidades.

---

## 🎯 Categoria A: Endpoints Básicos

### Instâncias
1. "como criar uma instância"
2. "criar nova instância whatsapp"
3. "deletar instância"
4. "listar todas as instâncias"
5. "status da instância"
6. "verificar se instância está conectada"
7. "restart instância"
8. "configurar instância"

### Mensagens Básicas
9. "enviar mensagem texto"
10. "enviar mensagem para contato"
11. "enviar mensagem para grupo"
12. "enviar imagem"
13. "enviar arquivo"
14. "enviar áudio"
15. "enviar vídeo"
16. "enviar documento"
17. "enviar localização"

### Contatos e Grupos
18. "listar contatos"
19. "buscar contato"
20. "adicionar contato"
21. "listar grupos"
22. "criar grupo"
23. "adicionar membro ao grupo"
24. "remover membro do grupo"
25. "sair do grupo"

---

## 🎯 Categoria B: Filtros (Context Enhancement)

### Filtros de Áudio
26. "filtros de áudio por duração"
27. "filtrar áudio maior que 30 segundos"
28. "filtro de áudio por tamanho"
29. "bloquear áudios longos"
30. "configurar limite de duração do áudio"

### Filtros de Mensagem
31. "configurar filtro de mensagem"
32. "filtro por tipo de arquivo"
33. "filtros de texto com padrão"
34. "filtrar mensagens por palavra-chave"
35. "bloquear mensagens de spam"

### Filtros de Tamanho
36. "limitar tamanho de arquivo"
37. "filtro de imagem por tamanho"
38. "bloquear arquivos grandes"
39. "configurar limite de upload"
40. "filtrar por extensão de arquivo"

---

## 🎯 Categoria C: Webhooks (Context Enhancement)

### Configuração de Webhooks
41. "webhook de monitoramento"
42. "configurar callback URL"
43. "webhook para mensagens"
44. "webhook para status"
45. "configurar webhook global"

### Health Check e Monitoramento
46. "health check do webhook"
47. "testar webhook"
48. "verificar status do webhook"
49. "monitorar webhook"
50. "logs do webhook"

### Sistema Dual Webhook
51. "sistema dual webhook"
52. "configurar webhook primário e secundário"
53. "failover de webhook"
54. "webhook backup"
55. "redundância de webhook"

### Retry e Recuperação
56. "retry de webhook"
57. "configurar tentativas de webhook"
58. "webhook com retry automático"
59. "timeout do webhook"
60. "recuperação de webhook"

---

## 🎯 Categoria D: Queries Complexas

### Bots e Automação
61. "como configurar um bot que responde apenas comandos com prefixo"
62. "bot com respostas automáticas"
63. "chatbot personalizado"
64. "autoresponder com filtros"
65. "bot que responde apenas em grupos"

### Cenários Avançados
66. "webhook que recebe só mensagens de áudio filtradas"
67. "instância com filtros de grupo e retry automático"
68. "sistema de fila com prioridade"
69. "webhook com autenticação personalizada"
70. "instância com múltiplos webhooks"

### Monitoramento e Filas
71. "monitoramento de fila global com alertas"
72. "dashboard de métricas"
73. "relatório de performance"
74. "análise de uso da API"
75. "estatísticas de mensagens"

---

## 🎯 Categoria E: Integrações e Recursos Avançados

### Integrações
76. "integração com banco de dados"
77. "conectar com API externa"
78. "sincronização de dados"
79. "backup automático"
80. "exportar conversas"

### Recursos de Mídia
81. "processamento de imagem"
82. "conversão de áudio"
83. "thumbnail de vídeo"
84. "compressão de arquivo"
85. "análise de conteúdo"

### Segurança e Autenticação
86. "configurar autenticação"
87. "API key management"
88. "controle de acesso"
89. "criptografia de mensagens"
90. "audit log"

---

## 🎯 Categoria F: Edge Cases e Casos Extremos

### Entradas Inválidas
91. "asdfghjkl"
92. ""
93. "a"
94. "123456789"
95. "!@#$%^&*()"

### Queries Irrelevantes
96. "como fazer um bolo de chocolate"
97. "previsão do tempo"
98. "receita de lasanha"
99. "como trocar pneu do carro"
100. "qual o melhor smartphone"

### Queries Ambíguas
101. "xpto endpoint inexistente"
102. "configurar coisa"
103. "fazer alguma coisa"
104. "api do negócio"
105. "sistema da empresa"

### Queries Técnicas Fora do Escopo
106. "como instalar linux"
107. "configurar nginx"
108. "banco de dados mysql"
109. "deploy no kubernetes"
110. "configurar docker"

---

## 🎯 Categoria G: Queries de Troubleshooting

### Problemas Comuns
111. "instância não conecta"
112. "erro ao enviar mensagem"
113. "webhook não funciona"
114. "problema de autenticação"
115. "timeout na API"

### Debugging
116. "como debugar erros"
117. "logs de erro"
118. "troubleshooting de conexão"
119. "resolver problema de performance"
120. "erro 500 na API"

---

## 📊 Resumo

**Total de Prompts:** 120

**Distribuição por Categoria:**
- Básicos: 25 prompts
- Filtros: 15 prompts
- Webhooks: 20 prompts
- Complexas: 15 prompts
- Integrações: 15 prompts
- Edge Cases: 15 prompts
- Troubleshooting: 10 prompts
- Outros: 5 prompts

**Cobertura Esperada:**
- ✅ Todos os endpoints principais
- ✅ Funcionalidades de filtro
- ✅ Sistema de webhooks completo
- ✅ Casos extremos e edge cases
- ✅ Cenários de erro e troubleshooting