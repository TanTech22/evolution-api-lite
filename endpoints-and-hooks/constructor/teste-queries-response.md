# 🧪 Respostas dos Testes do Constructor

## 📋 Objetivo

Este documento acumula as respostas dos testes do Evolution API Constructor, organizadas por prompt com suas respectivas métricas e resultados.

**Início dos Testes:** 2025-10-01 22:07:35

---

## 17. Prompt: "enviar localização"

**Métricas:**
- Tempo de resposta: 21.70s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendLocation/{instanceName}', 'name': 'Enviar Localização', 'category': 'Message Controller', 'description': 'Envia uma mensagem com localização geográfica para um contato ou grupo no WhatsApp', 'purpose': 'Compartilhar coordenadas geográficas via WhatsApp', 'when_to_use': ['Quando precisar enviar uma localização específica', 'Para compartilhar endereços via coordenadas', 'Em integrações que necessitam envio automatizado de localizações']}, 'auth...

---

## 1. Prompt: "como criar uma instância"

**Métricas:**
- Tempo de resposta: 25.64s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/create', 'name': 'Criar Instância', 'category': 'Instance Management - Basic', 'description': 'Cria uma nova instância do WhatsApp com configurações personalizadas', 'purpose': 'Inicializar uma nova instância do WhatsApp para automação', 'when_to_use': ['Quando precisar criar uma nova conexão WhatsApp', 'Para iniciar uma nova instância com webhook configurado', 'Ao configurar um novo bot de atendimento']}, 'authentication': {'required': True, 't...

---

## 18. Prompt: "listar contatos"

**Métricas:**
- Tempo de resposta: 31.12s
- Context enhancement: Não
- Final score: 0.25

**Resposta:**
ERRO

---

## 2. Prompt: "criar nova instância whatsapp"

**Métricas:**
- Tempo de resposta: 25.33s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/create', 'name': 'Criar Instância WhatsApp', 'category': 'Instance Management - Basic', 'description': 'Cria uma nova instância do WhatsApp com configurações personalizadas', 'purpose': 'Inicializar uma nova conexão WhatsApp com webhook e configurações específicas', 'when_to_use': ['Quando precisar criar uma nova instância do WhatsApp', 'Para iniciar um novo bot de atendimento', 'Quando necessitar configurar webhooks personalizados']}, 'authenti...

---

## 3. Prompt: "deletar instância"

**Métricas:**
- Tempo de resposta: 12.48s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'DELETE', 'path': '/instance/{instanceName}/delete', 'name': 'Deletar Instância', 'category': 'Instance Management - Basic', 'description': 'Remove permanentemente uma instância do WhatsApp do sistema', 'purpose': 'Deletar completamente uma instância e todos seus dados associados', 'when_to_use': ['Quando precisar remover definitivamente uma instância', 'Quando for necessário liberar recursos do sistema', 'Ao encerrar definitivamente um bot/conexão WhatsApp']}, 'authentic...

---

## 19. Prompt: "buscar contato"

**Métricas:**
- Tempo de resposta: 39.23s
- Context enhancement: Sim
- Final score: 0.35

**Resposta:**
ERRO

---

## 4. Prompt: "listar todas as instâncias"

**Métricas:**
- Tempo de resposta: 13.33s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/fetchInstances', 'name': 'Listar Instâncias', 'category': 'Instance Management - Basic', 'description': 'Retorna uma lista de todas as instâncias do WhatsApp configuradas no sistema', 'purpose': 'Obter informações sobre todas as instâncias existentes, incluindo seus status, nomes de perfil e QR codes', 'when_to_use': ['Quando precisar listar todas as instâncias disponíveis', 'Para verificar o status de múltiplas instâncias', 'Para obter uma visão...

---

## 5. Prompt: "status da instância"

**Métricas:**
- Tempo de resposta: 11.08s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/', 'name': 'Status da API', 'category': 'API Status', 'description': 'Verifica o status de funcionamento da API Evolution', 'purpose': 'Verificar se a API está online e obter informações básicas', 'when_to_use': ['Ao verificar se o serviço está operacional', 'Para obter a versão atual da API', 'Para acessar links de documentação e gerenciamento']}, 'authentication': {'required': False, 'type': None, 'key': None, 'description': 'Endpoint público que não re...

---

## 6. Prompt: "verificar se instância está conectada"

**Métricas:**
- Tempo de resposta: 14.99s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas sobre o estado e performance da instância WhatsApp', 'purpose': 'Monitorar estado de conexão e métricas de performance da instância', 'when_to_use': ['Quando precisar verificar se a instância está conectada', 'Quando necessitar monitorar performance e uso de recursos', 'Para obter estatísticas de mens...

---

## 20. Prompt: "adicionar contato"

**Métricas:**
- Tempo de resposta: 30.39s
- Context enhancement: Não
- Final score: 0.30

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendLocation/{instanceName}', 'name': 'Enviar Localização', 'category': 'Message Controller', 'description': 'Envia uma mensagem com localização para um contato no WhatsApp', 'purpose': 'Compartilhar uma localização específica com coordenadas e detalhes', 'when_to_use': ['Quando precisar enviar uma localização para um contato', 'Quando quiser compartilhar um endereço com coordenadas geográficas']}, 'authentication': {'required': True, 'type': 'he...

---

## 7. Prompt: "restart instância"

**Métricas:**
- Tempo de resposta: 13.86s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'PUT', 'path': '/instance/{instanceName}/connect', 'name': 'Conectar/Reconectar Instância', 'category': 'Instance Management', 'description': 'Endpoint para conectar ou reconectar uma instância do WhatsApp após logout ou desconexão', 'purpose': 'Reestabelecer conexão de uma instância WhatsApp', 'when_to_use': ['Quando a instância estiver desconectada', 'Após um logout', 'Para reconectar uma sessão expirada', 'Para reiniciar uma conexão com problemas']}, 'authentication': ...

---

## 21. Prompt: "listar grupos"

**Métricas:**
- Tempo de resposta: 26.07s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
ERRO

---

## 8. Prompt: "configurar instância"

**Métricas:**
- Tempo de resposta: 17.32s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/settings/set/{instanceName}', 'name': 'Configurar Instância', 'category': 'Settings Controller', 'description': 'Endpoint para configurar as preferências e comportamentos de uma instância WhatsApp', 'purpose': 'Permite definir configurações globais para uma instância específica do WhatsApp', 'when_to_use': ['Quando precisar configurar comportamentos automáticos da instância', 'Para definir como a instância deve lidar com chamadas, grupos e mensagens', 'A...

---

## 22. Prompt: "criar grupo"

**Métricas:**
- Tempo de resposta: 24.58s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
ERRO

---

## 9. Prompt: "enviar mensagem texto"

**Métricas:**
- Tempo de resposta: 24.87s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendText/{instanceName}', 'name': 'Enviar Texto', 'category': 'Message Controller', 'description': 'Endpoint para enviar mensagens de texto via WhatsApp', 'purpose': 'Enviar mensagens de texto simples ou com formatação para contatos/grupos', 'when_to_use': ['Quando precisar enviar mensagens de texto para contatos', 'Quando necessitar incluir menções ou citações', 'Para enviar textos com preview de links']}, 'authentication': {'required': True, 't...

---

## 10. Prompt: "enviar mensagem para contato"

**Métricas:**
- Tempo de resposta: 23.59s
- Context enhancement: Sim
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendLocation/{instanceName}', 'name': 'Enviar Localização', 'category': 'Message Controller', 'description': 'Envia uma mensagem com localização para um contato no WhatsApp', 'purpose': 'Compartilhar uma localização específica com um contato via WhatsApp', 'when_to_use': ['Quando precisar enviar uma localização para um contato', 'Quando quiser compartilhar um endereço com coordenadas geográficas']}, 'authentication': {'required': True, 'type': 'h...

---

## 23. Prompt: "adicionar membro ao grupo"

**Métricas:**
- Tempo de resposta: 30.37s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 11. Prompt: "enviar mensagem para grupo"

**Métricas:**
- Tempo de resposta: 26.01s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 24. Prompt: "remover membro do grupo"

**Métricas:**
- Tempo de resposta: 27.37s
- Context enhancement: Não
- Final score: 0.22

**Resposta:**
ERRO

---

## 12. Prompt: "enviar imagem"

**Métricas:**
- Tempo de resposta: 27.04s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendMedia/{instanceName}', 'name': 'Enviar Mídia', 'category': 'Message Controller', 'description': 'Endpoint para enviar mensagens com mídia (imagens, vídeos, documentos, etc) via WhatsApp', 'purpose': 'Permitir o envio de arquivos de mídia para contatos do WhatsApp', 'when_to_use': ['Quando precisar enviar imagens para contatos', 'Para compartilhar vídeos ou documentos', 'Para enviar mídia com legenda']}, 'authentication': {'required': True, 't...

---

## 25. Prompt: "sair do grupo"

**Métricas:**
- Tempo de resposta: 28.22s
- Context enhancement: Não
- Final score: 0.36

**Resposta:**
ERRO

---

## 13. Prompt: "enviar arquivo"

**Métricas:**
- Tempo de resposta: 26.66s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendMedia/{instanceName}', 'name': 'Enviar Mídia', 'category': 'Message Controller', 'description': 'Endpoint para enviar mensagens com arquivos de mídia (imagens, vídeos, documentos, etc)', 'purpose': 'Permitir o envio de arquivos de mídia via WhatsApp', 'when_to_use': ['Quando precisar enviar imagens', 'Quando precisar enviar vídeos', 'Quando precisar enviar documentos', 'Quando precisar enviar áudios']}, 'authentication': {'required': True, 't...

---

## 26. Prompt: "filtros de áudio por duração"

**Métricas:**
- Tempo de resposta: 25.78s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações atuais dos filtros de áudio da instância, incluindo limites de duração, tamanho e estatísticas', 'purpose': 'Obter configurações e estatísticas dos filtros de áudio aplicados na instância', 'when_to_use': ['Quando precisar verificar as configurações de filtros de áudio', 'Para auditar limites ...

---

## 27. Prompt: "filtrar áudio maior que 30 segundos"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 14. Prompt: "enviar áudio"

**Métricas:**
- Tempo de resposta: 25.45s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendWhatsAppAudio/{instanceName}', 'name': 'Enviar Áudio WhatsApp', 'category': 'Message Controller', 'description': 'Endpoint para enviar mensagens de áudio via WhatsApp', 'purpose': 'Permite enviar arquivos de áudio para contatos ou grupos no WhatsApp', 'when_to_use': ['Quando precisar enviar mensagens de voz', 'Para compartilhar arquivos de áudio com contatos', 'Em automações que requerem envio de áudio']}, 'authentication': {'required': True,...

---

## 28. Prompt: "filtro de áudio por tamanho"

**Métricas:**
- Tempo de resposta: 26.70s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações atuais dos filtros de áudio da instância, incluindo limites de tamanho, duração e estatísticas', 'purpose': 'Verificar e auditar as configurações de filtros de áudio', 'when_to_use': ['Quando precisar consultar os limites configurados para áudios', 'Para verificar estatísticas de processamento...

---

## 29. Prompt: "bloquear áudios longos"

**Métricas:**
- Tempo de resposta: 13.08s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 30. Prompt: "configurar limite de duração do áudio"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 31. Prompt: "configurar filtro de mensagem"

**Métricas:**
- Tempo de resposta: 19.93s
- Context enhancement: Não
- Final score: 0.75

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook e Filtros de Mensagem', 'category': 'Webhook', 'description': 'Configura os parâmetros de webhook e filtros para processamento de mensagens', 'purpose': 'Permite definir regras e filtros para o processamento de mensagens e comportamento do webhook', 'when_to_use': ['Quando precisar configurar filtros específicos para mensagens', 'Para definir regras de processamento do webhook', 'Para configurar co...

---

## 32. Prompt: "filtro por tipo de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 15. Prompt: "enviar vídeo"

**Métricas:**
- Tempo de resposta: 43.56s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendMedia/{instanceName}', 'name': 'Enviar Mídia', 'category': 'Message Controller', 'description': 'Endpoint para enviar mensagens com mídia (imagens, vídeos, documentos, etc)', 'purpose': 'Permite enviar diferentes tipos de mídia para contatos no WhatsApp', 'when_to_use': ['Quando precisar enviar vídeos', 'Quando precisar enviar imagens', 'Quando precisar enviar documentos', 'Quando precisar enviar áudios']}, 'authentication': {'required': True...

---

## 33. Prompt: "filtros de texto com padrão"

**Métricas:**
- Tempo de resposta: 25.07s
- Context enhancement: Sim
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Endpoint para consultar as configurações de filtros de áudio de uma instância', 'purpose': 'Recuperar configurações atuais dos filtros de áudio e estatísticas de uso', 'when_to_use': ['Quando precisar verificar as configurações de filtros de áudio', 'Para auditar estatísticas de processamento de áudios', 'Para verific...

---

## 16. Prompt: "enviar documento"

**Métricas:**
- Tempo de resposta: 27.18s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendMedia/{instanceName}', 'name': 'Enviar Mídia', 'category': 'Message Controller', 'description': 'Endpoint para enviar mensagens com mídia (documentos, imagens, vídeos, áudio)', 'purpose': 'Permite enviar diferentes tipos de mídia para contatos no WhatsApp', 'when_to_use': ['Quando precisar enviar documentos', 'Quando precisar enviar imagens', 'Quando precisar enviar vídeos', 'Quando precisar enviar áudios']}, 'authentication': {'required': Tr...

---

## 34. Prompt: "filtrar mensagens por palavra-chave"

**Métricas:**
- Tempo de resposta: 17.92s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 35. Prompt: "bloquear mensagens de spam"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 36. Prompt: "limitar tamanho de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 37. Prompt: "filtro de imagem por tamanho"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 17. Prompt: "enviar localização"

**Métricas:**
- Tempo de resposta: 23.43s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendLocation/{instanceName}', 'name': 'Enviar Localização', 'category': 'Message Controller', 'description': 'Envia uma mensagem com localização geográfica para um contato ou grupo no WhatsApp', 'purpose': 'Compartilhar coordenadas geográficas via WhatsApp', 'when_to_use': ['Quando precisar enviar uma localização específica', 'Para compartilhar endereços via coordenadas', 'Em integrações que necessitam envio automatizado de localizações']}, 'auth...

---

## 38. Prompt: "bloquear arquivos grandes"

**Métricas:**
- Tempo de resposta: 25.47s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar mensagens de status do WhatsApp', 'purpose': 'Permite buscar e filtrar mensagens de status', 'when_to_use': ['Quando precisar consultar mensagens de status', 'Para monitorar atualizações de status']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chave de API obrigatóri...

---

## 18. Prompt: "listar contatos"

**Métricas:**
- Tempo de resposta: 30.36s
- Context enhancement: Não
- Final score: 0.25

**Resposta:**
ERRO

---

## 39. Prompt: "configurar limite de upload"

**Métricas:**
- Tempo de resposta: 20.26s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'PUT', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Websocket', 'category': 'Websocket', 'description': 'Configura os parâmetros do websocket incluindo limites de upload e outras configurações', 'purpose': 'Permite configurar diversos aspectos do websocket incluindo delays, timeouts e limites', 'when_to_use': ['Quando precisar ajustar configurações do websocket', 'Para definir limites de operação', 'Para configurar comportamentos de mensagens']}, 'authentica...

---

## 40. Prompt: "filtrar por extensão de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 41. Prompt: "webhook de monitoramento"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 42. Prompt: "configurar callback URL"

**Métricas:**
- Tempo de resposta: 14.50s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook URL', 'category': 'Webhook', 'description': 'Configura a URL de webhook para receber eventos da instância WhatsApp', 'purpose': 'Permitir configuração do endpoint que receberá as notificações de eventos', 'when_to_use': ['Quando precisar configurar um endpoint para receber callbacks', 'Para integrar a Evolution API com sistemas externos', 'Ao implementar webhooks para eventos do WhatsApp']}, 'authe...

---

## 43. Prompt: "webhook para mensagens"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 19. Prompt: "buscar contato"

**Métricas:**
- Tempo de resposta: 45.01s
- Context enhancement: Sim
- Final score: 0.35

**Resposta:**
ERRO

---

## 44. Prompt: "webhook para status"

**Métricas:**
- Tempo de resposta: 33.71s
- Context enhancement: Não
- Final score: 0.23

**Resposta:**
ERRO

---

## 20. Prompt: "adicionar contato"

**Métricas:**
- Tempo de resposta: 34.41s
- Context enhancement: Não
- Final score: 0.30

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/message/sendLocation/{instanceName}', 'name': 'Enviar Localização', 'category': 'Message Controller', 'description': 'Endpoint para enviar uma mensagem com localização para um contato no WhatsApp', 'purpose': 'Permite enviar coordenadas geográficas com detalhes de localização', 'when_to_use': ['Quando precisar compartilhar uma localização específica', 'Para enviar endereços com coordenadas', 'Para compartilhar pontos de interesse com detalhes']}, 'authen...

---

## 45. Prompt: "configurar webhook global"

**Métricas:**
- Tempo de resposta: 21.76s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/webhook/global/config', 'name': 'Consultar Configuração Global de Webhook', 'category': 'Global Webhook Configuration', 'description': 'Endpoint para consultar as configurações globais de webhook da Evolution API', 'purpose': 'Obter as configurações atuais do webhook global, incluindo URLs, headers, timeouts e estatísticas', 'when_to_use': ['Quando precisar verificar as configurações atuais do webhook global', 'Para debug de problemas relacionados a webho...

---

## 46. Prompt: "health check do webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 21. Prompt: "listar grupos"

**Métricas:**
- Tempo de resposta: 32.59s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
ERRO

---

## 47. Prompt: "testar webhook"

**Métricas:**
- Tempo de resposta: 30.95s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/test', 'name': 'Testar Webhook', 'category': 'Dual Webhook System - Testing', 'description': 'Endpoint para testar a conectividade e funcionamento de webhooks configurados', 'purpose': 'Validar se um webhook está respondendo corretamente e testar sua integração', 'when_to_use': ['Quando precisar verificar se um webhook está acessível', 'Para validar se um webhook está processando payloads corretamente', 'Durante a configuração inicial de webhooks...

---

## 22. Prompt: "criar grupo"

**Métricas:**
- Tempo de resposta: 27.96s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
ERRO

---

## 48. Prompt: "verificar status do webhook"

**Métricas:**
- Tempo de resposta: 29.46s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/cleanup/status', 'name': 'Status do Cleanup', 'category': 'S3 Cleanup System', 'description': 'Retorna informações detalhadas sobre o status do sistema de limpeza', 'purpose': 'Monitorar o estado atual do sistema de limpeza e suas estatísticas', 'when_to_use': ['Quando precisar verificar o estado atual do sistema de limpeza', 'Para monitorar estatísticas de execuções anteriores', 'Para verificar próximas execuções agendadas']}, 'authentication': {'require...

---

## 49. Prompt: "monitorar webhook"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 50. Prompt: "logs do webhook"

**Métricas:**
- Tempo de resposta: 23.51s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'DELETE', 'path': '/webhook/logs', 'name': 'Limpar Logs do Webhook', 'category': 'Dual Webhook System - Logs', 'description': 'Endpoint para limpar os logs e métricas do sistema de webhook', 'purpose': 'Manutenção de performance através da limpeza dos logs acumulados', 'when_to_use': ['Quando o sistema estiver com muitos logs acumulados', 'Durante manutenção preventiva', 'Para otimizar performance do webhook']}, 'authentication': {'required': True, 'type': 'header', 'key'...

---

## 51. Prompt: "sistema dual webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 52. Prompt: "configurar webhook primário e secundário"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 53. Prompt: "failover de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 54. Prompt: "webhook backup"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 55. Prompt: "redundância de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 56. Prompt: "retry de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 57. Prompt: "configurar tentativas de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 58. Prompt: "webhook com retry automático"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 23. Prompt: "adicionar membro ao grupo"

**Métricas:**
- Tempo de resposta: 30.27s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 59. Prompt: "timeout do webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 60. Prompt: "recuperação de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 61. Prompt: "como configurar um bot que responde apenas comandos com prefixo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 62. Prompt: "bot com respostas automáticas"

**Métricas:**
- Tempo de resposta: 14.08s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/group/findGroupInfos/{instanceName}', 'name': 'Buscar Informações do Grupo', 'category': 'Groups', 'description': 'Retorna informações detalhadas sobre um grupo do WhatsApp', 'purpose': 'Obter dados e configurações de um grupo específico', 'when_to_use': ['Quando precisar consultar informações de um grupo', 'Para verificar participantes e configurações', 'Para obter metadados do grupo como subject, owner, etc']}, 'authentication': {'required': True, 'type...

---

## 24. Prompt: "remover membro do grupo"

**Métricas:**
- Tempo de resposta: 27.85s
- Context enhancement: Não
- Final score: 0.22

**Resposta:**
ERRO

---

## 63. Prompt: "chatbot personalizado"

**Métricas:**
- Tempo de resposta: 29.84s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/group/fetchAllGroups/{instanceName}', 'name': 'Buscar Todos os Grupos', 'category': 'Evolution Bot', 'description': 'Endpoint para buscar todos os grupos do WhatsApp associados à instância', 'purpose': 'Recuperar a lista completa de grupos onde o bot/número está presente', 'when_to_use': ['Quando precisar listar todos os grupos que o bot participa', 'Para fazer gestão e monitoramento dos grupos']}, 'authentication': {'required': True, 'type': 'header', 'k...

---

## 25. Prompt: "sair do grupo"

**Métricas:**
- Tempo de resposta: 28.41s
- Context enhancement: Não
- Final score: 0.36

**Resposta:**
ERRO

---

## 64. Prompt: "autoresponder com filtros"

**Métricas:**
- Tempo de resposta: 24.64s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters', 'name': 'Consultar Filtros da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações atuais de filtros da instância, incluindo webhooks, filtros de mensagem e processamento de áudio', 'purpose': 'Auditoria e visualização das configurações de filtros ativos', 'when_to_use': ['Quando precisar verificar as configurações atuais de filtros', 'Para auditar regras de processamento de m...

---

## 65. Prompt: "bot que responde apenas em grupos"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 66. Prompt: "webhook que recebe só mensagens de áudio filtradas"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 67. Prompt: "instância com filtros de grupo e retry automático"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 68. Prompt: "sistema de fila com prioridade"

**Métricas:**
- Tempo de resposta: 13.31s
- Context enhancement: Não
- Final score: 0.65

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/queue/stats', 'name': 'Estatísticas da Fila', 'category': 'Global Queue System', 'description': 'Retorna estatísticas detalhadas do sistema de fila, incluindo métricas de processamento, taxa de utilização e configurações', 'purpose': 'Monitorar e analisar o desempenho do sistema de fila global', 'when_to_use': ['Quando precisar monitorar o status atual da fila', 'Para análise de performance do sistema', 'Para verificar métricas de processamento', 'Para ac...

---

## 26. Prompt: "filtros de áudio por duração"

**Métricas:**
- Tempo de resposta: 29.25s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações atuais dos filtros de áudio da instância, incluindo limites de duração, tamanho e estatísticas de processamento', 'purpose': 'Obter configurações e estatísticas dos filtros de áudio aplicados na instância', 'when_to_use': ['Quando precisar verificar as configurações de filtros de áudio', 'Para...

---

## 69. Prompt: "webhook com autenticação personalizada"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 27. Prompt: "filtrar áudio maior que 30 segundos"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 28. Prompt: "filtro de áudio por tamanho"

**Métricas:**
- Tempo de resposta: 28.22s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações atuais dos filtros de áudio da instância, incluindo limites de tamanho, duração e estatísticas', 'purpose': 'Verificar e auditar as configurações de filtros de áudio', 'when_to_use': ['Quando precisar consultar os limites configurados para áudios', 'Para verificar estatísticas de processamento...

---

## 70. Prompt: "instância com múltiplos webhooks"

**Métricas:**
- Tempo de resposta: 35.96s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/create', 'name': 'Criar Instância com Webhook', 'category': 'Instance Management - Basic', 'description': 'Cria uma nova instância do WhatsApp com configurações avançadas de webhook', 'purpose': 'Criar e configurar uma instância com múltiplos eventos de webhook e filtros', 'when_to_use': ['Quando precisar criar uma nova instância com webhook personalizado', 'Quando necessitar configurar filtros específicos para mensagens', 'Quando precisar proce...

---

## 29. Prompt: "bloquear áudios longos"

**Métricas:**
- Tempo de resposta: 16.19s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 30. Prompt: "configurar limite de duração do áudio"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 71. Prompt: "monitoramento de fila global com alertas"

**Métricas:**
- Tempo de resposta: 25.45s
- Context enhancement: Sim
- Final score: 0.65

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/global/config', 'name': 'Criar/Atualizar Configuração Global de Webhook', 'category': 'Global Webhook Configuration', 'description': 'Configura webhooks globais para monitoramento e eventos principais', 'purpose': 'Estabelecer endpoints para recebimento de notificações e monitoramento global do sistema', 'when_to_use': ['Quando precisar configurar monitoramento centralizado', 'Para estabelecer webhooks de notificação global', 'Para configurar hea...

---

## 31. Prompt: "configurar filtro de mensagem"

**Métricas:**
- Tempo de resposta: 19.89s
- Context enhancement: Não
- Final score: 0.75

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook e Filtros de Mensagem', 'category': 'Webhook', 'description': 'Configura os parâmetros de webhook e filtros para processamento de mensagens', 'purpose': 'Permite definir regras e filtros para o processamento de mensagens e comportamento do webhook', 'when_to_use': ['Quando precisar configurar filtros específicos para mensagens', 'Para definir regras de processamento do webhook', 'Para configurar co...

---

## 32. Prompt: "filtro por tipo de arquivo"

**Métricas:**
- Tempo de resposta: 0.08s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 72. Prompt: "dashboard de métricas"

**Métricas:**
- Tempo de resposta: 13.45s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/queue/metrics/reset', 'name': 'Resetar Métricas da Fila', 'category': 'Global Queue System', 'description': 'Endpoint para resetar todas as métricas do sistema de fila global', 'purpose': 'Limpar e reiniciar as métricas acumuladas do sistema de fila', 'when_to_use': ['Quando precisar zerar contadores de métricas', 'Em manutenções programadas do sistema', 'Para iniciar um novo período de medição']}, 'authentication': {'required': True, 'type': 'header', '...

---

## 73. Prompt: "relatório de performance"

**Métricas:**
- Tempo de resposta: 14.56s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas de performance e uso da instância WhatsApp', 'purpose': 'Monitorar performance, uso de recursos e estatísticas operacionais da instância', 'when_to_use': ['Quando precisar monitorar o desempenho da instância', 'Para análise de uso de recursos (CPU, memória)', 'Para verificar estatísticas de mensagens ...

---

## 33. Prompt: "filtros de texto com padrão"

**Métricas:**
- Tempo de resposta: 28.83s
- Context enhancement: Sim
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Endpoint para consultar as configurações de filtros de áudio da instância', 'purpose': 'Recuperar configurações atuais dos filtros de áudio e estatísticas de uso', 'when_to_use': ['Quando precisar verificar as configurações de filtros de áudio', 'Para auditar estatísticas de processamento de áudios', 'Para verificar l...

---

## 74. Prompt: "análise de uso da API"

**Métricas:**
- Tempo de resposta: 18.70s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas de uso e performance de uma instância WhatsApp', 'purpose': 'Monitorar e analisar o uso, performance e estado de uma instância específica', 'when_to_use': ['Quando precisar analisar o uso de recursos da instância', 'Para monitorar performance e estado da conexão', 'Para obter estatísticas de mensagens...

---

## 34. Prompt: "filtrar mensagens por palavra-chave"

**Métricas:**
- Tempo de resposta: 20.99s
- Context enhancement: Não
- Final score: 0.17

**Resposta:**
ERRO

---

## 35. Prompt: "bloquear mensagens de spam"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 36. Prompt: "limitar tamanho de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 37. Prompt: "filtro de imagem por tamanho"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 75. Prompt: "estatísticas de mensagens"

**Métricas:**
- Tempo de resposta: 24.40s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio/stats', 'name': 'Estatísticas de Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna estatísticas detalhadas sobre o processamento de mensagens de áudio na instância', 'purpose': 'Monitorar e analisar o processamento de mensagens de áudio', 'when_to_use': ['Quando precisar analisar o volume de áudios processados', 'Para verificar taxas de sucesso e filtragem', 'Para otimizar config...

---

## 76. Prompt: "integração com banco de dados"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 38. Prompt: "bloquear arquivos grandes"

**Métricas:**
- Tempo de resposta: 27.21s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar mensagens de status do WhatsApp', 'purpose': 'Permite buscar e filtrar mensagens de status', 'when_to_use': ['Quando precisar consultar mensagens de status', 'Para monitorar atualizações de status']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chave de API obrigatóri...

---

## 77. Prompt: "conectar com API externa"

**Métricas:**
- Tempo de resposta: 15.63s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/{instanceName}/connect', 'name': 'Conectar Instância WhatsApp', 'category': 'Instance Management - Basic', 'description': 'Endpoint para conectar uma instância do WhatsApp através de QR Code ou reconexão', 'purpose': 'Estabelecer conexão entre a Evolution API e o WhatsApp', 'when_to_use': ['Quando precisar conectar uma nova instância do WhatsApp', 'Após um logout para reconectar a instância', 'Para gerar um novo QR Code de conexão']}, 'authentic...

---

## 39. Prompt: "configurar limite de upload"

**Métricas:**
- Tempo de resposta: 17.36s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'PUT', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Websocket', 'category': 'Websocket', 'description': 'Configura os parâmetros do websocket incluindo limites de upload e outras configurações', 'purpose': 'Permite configurar diversos aspectos do websocket incluindo delays, timeouts e limites', 'when_to_use': ['Quando precisar ajustar configurações do websocket', 'Para definir limites de operação', 'Para configurar comportamentos de mensagens e triggers']}, ...

---

## 40. Prompt: "filtrar por extensão de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 41. Prompt: "webhook de monitoramento"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 78. Prompt: "sincronização de dados"

**Métricas:**
- Tempo de resposta: 21.35s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/updateProfileName/{instanceName}', 'name': 'Atualizar Nome do Perfil', 'category': 'Profile Management', 'description': 'Atualiza o nome do perfil da instância WhatsApp', 'purpose': 'Permite modificar o nome de exibição do perfil WhatsApp', 'when_to_use': ['Quando precisar alterar o nome de exibição da conta', 'Durante configuração inicial do perfil', 'Para manter informações do perfil atualizadas']}, 'authentication': {'required': True, 'type': 'he...

---

## 79. Prompt: "backup automático"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 42. Prompt: "configurar callback URL"

**Métricas:**
- Tempo de resposta: 13.81s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook URL', 'category': 'Webhook', 'description': 'Configura a URL de webhook para receber eventos da instância WhatsApp', 'purpose': 'Permitir configuração do endpoint que receberá as notificações de eventos', 'when_to_use': ['Quando precisar configurar um endpoint para receber callbacks de eventos', 'Para integrar a Evolution API com sistemas externos via webhook']}, 'authentication': {'required': True...

---

## 43. Prompt: "webhook para mensagens"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 80. Prompt: "exportar conversas"

**Métricas:**
- Tempo de resposta: 24.79s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/webhook/logs/export?format={format}&since={since}', 'name': 'Exportar Logs do Webhook', 'category': 'Dual Webhook System - Logs', 'description': 'Endpoint para exportação de logs do sistema de webhook em diferentes formatos', 'purpose': 'Permitir a exportação e backup dos logs de webhook do sistema', 'when_to_use': ['Quando precisar fazer backup dos logs', 'Quando necessitar análise histórica das interações', 'Para auditoria de mensagens e eventos']}, 'au...

---

## 44. Prompt: "webhook para status"

**Métricas:**
- Tempo de resposta: 29.31s
- Context enhancement: Não
- Final score: 0.23

**Resposta:**
ERRO

---

## 81. Prompt: "processamento de imagem"

**Métricas:**
- Tempo de resposta: 21.09s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/process/finish', 'name': 'Finalizar Processamento', 'category': 'Processing Feedback System', 'description': 'Endpoint para finalizar e registrar o resultado do processamento de uma mensagem', 'purpose': 'Registrar o resultado final do processamento de uma mensagem e enviar feedback ao usuário', 'when_to_use': ['Após concluir o processamento de uma mensagem', 'Quando ocorrer um erro no processamento', 'Para abortar um processamento em andamento']}, 'auth...

---

## 45. Prompt: "configurar webhook global"

**Métricas:**
- Tempo de resposta: 26.01s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/webhook/global/config', 'name': 'Consultar Configuração Global de Webhook', 'category': 'Global Webhook Configuration', 'description': 'Endpoint para consultar as configurações globais de webhook da Evolution API', 'purpose': 'Obter as configurações atuais do webhook global, incluindo URLs, headers, timeouts e estatísticas', 'when_to_use': ['Quando precisar verificar as configurações atuais do webhook global', 'Para debug de problemas relacionados a webho...

---

## 46. Prompt: "health check do webhook"

**Métricas:**
- Tempo de resposta: 0.06s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 82. Prompt: "conversão de áudio"

**Métricas:**
- Tempo de resposta: 30.69s
- Context enhancement: Sim
- Final score: 0.65

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações e estatísticas dos filtros de áudio da instância', 'purpose': 'Auditoria e verificação das regras de processamento de áudio', 'when_to_use': ['Quando precisar verificar as configurações atuais de filtros de áudio', 'Para auditar estatísticas de processamento de áudio', 'Para validar regras de ...

---

## 83. Prompt: "thumbnail de vídeo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 84. Prompt: "compressão de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 85. Prompt: "análise de conteúdo"

**Métricas:**
- Tempo de resposta: 12.54s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/cleanup/status', 'name': 'Status do Cleanup', 'category': 'S3 Cleanup System', 'description': 'Retorna informações detalhadas sobre o status do sistema de limpeza automática de arquivos', 'purpose': 'Monitorar o estado atual do sistema de limpeza e obter estatísticas de execução', 'when_to_use': ['Quando precisar verificar o status atual do sistema de limpeza', 'Para monitorar estatísticas de execuções anteriores', 'Para verificar próximas execuções agend...

---

## 47. Prompt: "testar webhook"

**Métricas:**
- Tempo de resposta: 29.47s
- Context enhancement: Sim
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/test', 'name': 'Testar Webhook', 'category': 'Dual Webhook System - Testing', 'description': 'Endpoint para testar a conectividade e funcionamento de webhooks configurados', 'purpose': 'Validar se um webhook está respondendo corretamente e testar sua integração', 'when_to_use': ['Quando precisar verificar se um webhook está acessível', 'Para testar a integração antes de usar em produção', 'Para validar o formato de resposta do webhook', 'Para deb...

---

## 86. Prompt: "configurar autenticação"

**Métricas:**
- Tempo de resposta: 19.54s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook/Websocket', 'category': 'Webhook/Websocket', 'description': 'Configura os parâmetros de websocket para uma instância específica', 'purpose': 'Permite configurar as opções de websocket como triggers, expiração, mensagens e comportamentos', 'when_to_use': ['Quando precisar configurar a integração via websocket', 'Para definir comportamentos automáticos do websocket', 'Para configurar mensagens e trig...

---

## 87. Prompt: "API key management"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 48. Prompt: "verificar status do webhook"

**Métricas:**
- Tempo de resposta: 29.21s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/cleanup/status', 'name': 'Status do Cleanup', 'category': 'S3 Cleanup System', 'description': 'Retorna informações detalhadas sobre o status do sistema de limpeza', 'purpose': 'Monitorar o estado atual do sistema de limpeza e suas estatísticas', 'when_to_use': ['Quando precisar verificar o estado atual do sistema de limpeza', 'Para monitorar estatísticas de execuções anteriores', 'Para verificar próximas execuções agendadas']}, 'authentication': {'require...

---

## 49. Prompt: "monitorar webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 88. Prompt: "controle de acesso"

**Métricas:**
- Tempo de resposta: 15.79s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar mensagens de status do WhatsApp', 'purpose': 'Permite pesquisar e recuperar mensagens de status específicas', 'when_to_use': ['Quando precisar buscar mensagens de status específicas', 'Para monitorar status postados']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chav...

---

## 50. Prompt: "logs do webhook"

**Métricas:**
- Tempo de resposta: 20.26s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'DELETE', 'path': '/webhook/logs', 'name': 'Limpar Logs do Webhook', 'category': 'Dual Webhook System - Logs', 'description': 'Endpoint para limpar os logs e métricas do sistema de webhook', 'purpose': 'Manutenção de performance através da limpeza dos logs acumulados', 'when_to_use': ['Quando o sistema estiver com muitos logs acumulados', 'Durante manutenção preventiva', 'Para otimizar performance do webhook']}, 'authentication': {'required': True, 'type': 'header', 'key'...

---

## 89. Prompt: "criptografia de mensagens"

**Métricas:**
- Tempo de resposta: 14.91s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/chat/{instanceName}/mediaBase64/{messageId}', 'name': 'Obter Base64 de Mídia', 'category': 'Chat Controller', 'description': 'Endpoint para obter a representação em Base64 de uma mídia de mensagem', 'purpose': 'Converter mídia de mensagens em formato Base64 para processamento seguro', 'when_to_use': ['Quando precisar acessar o conteúdo de mídia em formato codificado', 'Para transmitir mídia de forma segura entre sistemas']}, 'authentication': {'required':...

---

## 51. Prompt: "sistema dual webhook"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 90. Prompt: "audit log"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 52. Prompt: "configurar webhook primário e secundário"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 91. Prompt: "asdfghjkl"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 53. Prompt: "failover de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 54. Prompt: "webhook backup"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 55. Prompt: "redundância de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 56. Prompt: "retry de webhook"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 57. Prompt: "configurar tentativas de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 58. Prompt: "webhook com retry automático"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 59. Prompt: "timeout do webhook"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 60. Prompt: "recuperação de webhook"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 61. Prompt: "como configurar um bot que responde apenas comandos com prefixo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 62. Prompt: "bot com respostas automáticas"

**Métricas:**
- Tempo de resposta: 13.77s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/group/findGroupInfos/{instanceName}', 'name': 'Buscar Informações do Grupo', 'category': 'Groups', 'description': 'Retorna informações detalhadas sobre um grupo do WhatsApp', 'purpose': 'Obter dados e configurações de um grupo específico', 'when_to_use': ['Quando precisar consultar informações de um grupo', 'Para verificar participantes e configurações', 'Para obter metadados do grupo como subject, owner, etc']}, 'authentication': {'required': True, 'type...

---

## 92. Prompt: "a"

**Métricas:**
- Tempo de resposta: 30.30s
- Context enhancement: Não
- Final score: 0.30

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/', 'name': 'Status da API', 'category': 'API Status', 'description': 'Endpoint para verificar o status e informações básicas da Evolution API', 'purpose': 'Verificar se a API está funcionando e obter links importantes', 'when_to_use': ['Ao verificar se a API está online', 'Para obter a versão atual da API', 'Para acessar links de documentação e gerenciamento']}, 'authentication': {'required': False, 'type': None, 'key': None, 'description': 'Não requer au...

---

## 93. Prompt: "123456789"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 94. Prompt: "!@#$%^&*()"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 95. Prompt: "como fazer um bolo de chocolate"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 96. Prompt: "previsão do tempo"

**Métricas:**
- Tempo de resposta: 15.33s
- Context enhancement: Não
- Final score: 0.16

**Resposta:**
ERRO

---

## 97. Prompt: "receita de lasanha"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 63. Prompt: "chatbot personalizado"

**Métricas:**
- Tempo de resposta: 29.67s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/group/fetchAllGroups/{instanceName}', 'name': 'Buscar Todos os Grupos', 'category': 'Evolution Bot', 'description': 'Endpoint para buscar todos os grupos do WhatsApp associados à instância', 'purpose': 'Recuperar a lista completa de grupos onde o bot/número está presente', 'when_to_use': ['Quando precisar listar todos os grupos que o bot participa', 'Para fazer gestão e monitoramento dos grupos']}, 'authentication': {'required': True, 'type': 'header', 'k...

---

## 98. Prompt: "como trocar pneu do carro"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 99. Prompt: "qual o melhor smartphone"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 100. Prompt: "xpto endpoint inexistente"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 101. Prompt: "configurar coisa"

**Métricas:**
- Tempo de resposta: 22.14s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Websocket', 'category': 'Websocket', 'description': 'Configura os parâmetros do websocket para uma instância específica', 'purpose': 'Permite personalizar o comportamento do websocket para recebimento de eventos', 'when_to_use': ['Quando precisar configurar o comportamento do websocket', 'Para definir regras de trigger e expiração', 'Para configurar mensagens automáticas e comportamentos']}, 'authenticatio...

---

## 102. Prompt: "fazer alguma coisa"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 103. Prompt: "api do negócio"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 64. Prompt: "autoresponder com filtros"

**Métricas:**
- Tempo de resposta: 24.76s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters', 'name': 'Consultar Filtros da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações atuais de filtros da instância, incluindo webhooks, filtros de mensagem e processamento de áudio', 'purpose': 'Auditoria e visualização das configurações de filtros ativos', 'when_to_use': ['Quando precisar verificar as configurações atuais de filtros', 'Para auditar regras de webhook e processa...

---

## 65. Prompt: "bot que responde apenas em grupos"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 66. Prompt: "webhook que recebe só mensagens de áudio filtradas"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 67. Prompt: "instância com filtros de grupo e retry automático"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 104. Prompt: "sistema da empresa"

**Métricas:**
- Tempo de resposta: 11.91s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/', 'name': 'Status da API', 'category': 'API Status', 'description': 'Endpoint para verificar o status de funcionamento da API', 'purpose': 'Verificar se a API está online e obter informações básicas do sistema', 'when_to_use': ['Ao verificar se o serviço está operacional', 'Para consultar a versão atual da API', 'Para obter links de documentação e gerenciamento']}, 'authentication': {'required': False, 'type': None, 'key': None, 'description': 'Não reque...

---

## 105. Prompt: "como instalar linux"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 68. Prompt: "sistema de fila com prioridade"

**Métricas:**
- Tempo de resposta: 13.62s
- Context enhancement: Não
- Final score: 0.65

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/queue/stats', 'name': 'Estatísticas da Fila', 'category': 'Global Queue System', 'description': 'Retorna estatísticas detalhadas do sistema de fila, incluindo métricas de processamento, taxa de utilização e configurações', 'purpose': 'Monitorar e analisar o desempenho do sistema de fila global', 'when_to_use': ['Quando precisar monitorar o status atual da fila', 'Para análise de performance do sistema', 'Para verificar métricas de processamento', 'Para ac...

---

## 69. Prompt: "webhook com autenticação personalizada"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 106. Prompt: "configurar nginx"

**Métricas:**
- Tempo de resposta: 19.20s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Websocket', 'category': 'Websocket', 'description': 'Configura os parâmetros do websocket para uma instância específica', 'purpose': 'Permite configurar comportamentos do websocket como triggers, expiração, mensagens e outros parâmetros', 'when_to_use': ['Quando precisar configurar o comportamento do websocket', 'Para definir triggers e respostas automáticas', 'Para ajustar parâmetros de conexão websocket'...

---

## 107. Prompt: "banco de dados mysql"

**Métricas:**
- Tempo de resposta: 15.91s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/settings/{instanceName}', 'name': 'Configurações de Privacidade', 'category': 'Instance Settings', 'description': 'Configura as definições de privacidade da instância WhatsApp', 'purpose': 'Gerenciar configurações de privacidade e visibilidade', 'when_to_use': ['Ao configurar uma nova instância', 'Quando precisar alterar configurações de privacidade']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chave...

---

## 70. Prompt: "instância com múltiplos webhooks"

**Métricas:**
- Tempo de resposta: 32.59s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/create', 'name': 'Criar Instância com Webhook', 'category': 'Instance Management - Basic', 'description': 'Cria uma nova instância do WhatsApp com configurações avançadas de webhook', 'purpose': 'Criar e configurar uma nova instância com múltiplos webhooks e filtros', 'when_to_use': ['Quando precisar criar uma nova instância com webhook personalizado', 'Quando necessitar configurar filtros específicos para mensagens', 'Quando precisar processar ...

---

## 108. Prompt: "deploy no kubernetes"

**Métricas:**
- Tempo de resposta: 18.31s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar mensagens de status do WhatsApp', 'purpose': 'Permite pesquisar e recuperar mensagens de status específicas', 'when_to_use': ['Quando precisar buscar mensagens de status específicas', 'Para monitorar status postados']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chav...

---

## 71. Prompt: "monitoramento de fila global com alertas"

**Métricas:**
- Tempo de resposta: 30.03s
- Context enhancement: Sim
- Final score: 0.65

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/global/config', 'name': 'Criar/Atualizar Configuração Global de Webhook', 'category': 'Global Webhook Configuration', 'description': 'Configura webhooks globais para monitoramento e eventos principais', 'purpose': 'Estabelecer endpoints para recebimento de notificações e monitoramento global do sistema', 'when_to_use': ['Quando precisar configurar monitoramento centralizado', 'Para estabelecer webhooks de notificação global', 'Para configurar hea...

---

## 109. Prompt: "configurar docker"

**Métricas:**
- Tempo de resposta: 18.72s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook/Websocket', 'category': 'Webhook/Websocket', 'description': 'Configura os parâmetros de websocket para uma instância específica', 'purpose': 'Permite personalizar o comportamento do websocket para integração', 'when_to_use': ['Quando precisar configurar integração via websocket', 'Para definir parâmetros de escuta e resposta do bot', 'Para gerenciar comportamento de mensagens automáticas']}, 'authe...

---

## 72. Prompt: "dashboard de métricas"

**Métricas:**
- Tempo de resposta: 13.31s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/queue/metrics/reset', 'name': 'Resetar Métricas da Fila', 'category': 'Global Queue System', 'description': 'Endpoint para resetar todas as métricas do sistema de fila global', 'purpose': 'Limpar e reiniciar as métricas acumuladas do sistema de fila', 'when_to_use': ['Quando precisar zerar contadores de métricas', 'Em manutenções programadas do sistema', 'Para iniciar um novo período de medição']}, 'authentication': {'required': True, 'type': 'header', '...

---

## 110. Prompt: "instância não conecta"

**Métricas:**
- Tempo de resposta: 13.92s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/{instanceName}/connect', 'name': 'Conectar Instância', 'category': 'Instance Management - Basic', 'description': 'Endpoint para conectar ou reconectar uma instância do WhatsApp', 'purpose': 'Estabelecer conexão do WhatsApp para uma instância específica', 'when_to_use': ['Quando precisar conectar uma instância pela primeira vez', 'Após um logout para reconectar', 'Quando a instância estiver desconectada']}, 'authentication': {'required': True, 't...

---

## 111. Prompt: "erro ao enviar mensagem"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 112. Prompt: "webhook não funciona"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 113. Prompt: "problema de autenticação"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 114. Prompt: "timeout na API"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 73. Prompt: "relatório de performance"

**Métricas:**
- Tempo de resposta: 15.95s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas de performance e uso da instância WhatsApp', 'purpose': 'Monitorar e analisar o desempenho operacional da instância', 'when_to_use': ['Quando precisar monitorar o uso de recursos (CPU, memória)', 'Para acompanhar métricas de mensagens e conexão', 'Para gerar relatórios de performance', 'Para avaliar a...

---

## 115. Prompt: "como debugar erros"

**Métricas:**
- Tempo de resposta: 14.81s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar e filtrar mensagens de status do WhatsApp', 'purpose': 'Permite pesquisar e recuperar mensagens de status específicas', 'when_to_use': ['Quando precisar buscar mensagens de status específicas', 'Para debug de mensagens de status', 'Para auditoria de mensagens']}, 'authentication': {'required': True, 'type': 'he...

---

## 74. Prompt: "análise de uso da API"

**Métricas:**
- Tempo de resposta: 16.03s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas de uso e performance de uma instância WhatsApp', 'purpose': 'Monitorar e analisar o uso, performance e estado de uma instância específica', 'when_to_use': ['Quando precisar analisar o uso de recursos da instância', 'Para monitorar performance e estado da conexão', 'Para obter estatísticas de mensagens...

---

## 75. Prompt: "estatísticas de mensagens"

**Métricas:**
- Tempo de resposta: 31.01s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio/stats', 'name': 'Estatísticas de Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna estatísticas detalhadas sobre o processamento de mensagens de áudio', 'purpose': 'Monitorar e analisar o processamento de mensagens de áudio na instância', 'when_to_use': ['Quando precisar analisar o volume de áudios processados', 'Para monitorar taxas de sucesso e filtragem', 'Para avaliar padrões...

---

## 76. Prompt: "integração com banco de dados"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 116. Prompt: "logs de erro"

**Métricas:**
- Tempo de resposta: 40.97s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/webhook/logs?type={type}&instance={instance}&limit={limit}&since={since}', 'name': 'Consultar Logs do Webhook', 'category': 'Dual Webhook System - Logs', 'description': 'Endpoint para consultar logs do sistema de webhooks, incluindo erros e eventos', 'purpose': 'Permitir monitoramento e debug de chamadas webhook', 'when_to_use': ['Quando precisar investigar erros de webhook', 'Para monitorar entregas de eventos', 'Para auditar chamadas webhook']}, 'authen...

---

## 77. Prompt: "conectar com API externa"

**Métricas:**
- Tempo de resposta: 13.92s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/{instanceName}/connect', 'name': 'Conectar Instância WhatsApp', 'category': 'Instance Management - Basic', 'description': 'Inicia a conexão de uma instância do WhatsApp, gerando QR Code se necessário', 'purpose': 'Estabelecer conexão entre a Evolution API e o WhatsApp', 'when_to_use': ['Quando precisar conectar uma nova instância do WhatsApp', 'Após um logout para reconectar a instância', 'Para gerar um novo QR Code de conexão']}, 'authenticatio...

---

## 117. Prompt: "troubleshooting de conexão"

**Métricas:**
- Tempo de resposta: 14.50s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/connectionState', 'name': 'Estado da Conexão', 'category': 'Instance Management - Basic', 'description': 'Retorna o estado atual de conexão da instância WhatsApp, incluindo informações do perfil quando conectado', 'purpose': 'Verificar status de conexão e troubleshooting', 'when_to_use': ['Quando precisar verificar se a instância está conectada', 'Durante troubleshooting de problemas de conexão', 'Para monitoramento do estado da co...

---

## 118. Prompt: "resolver problema de performance"

**Métricas:**
- Tempo de resposta: 13.84s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas de performance e uso da instância WhatsApp', 'purpose': 'Monitorar e diagnosticar problemas de performance da instância', 'when_to_use': ['Quando precisar analisar o consumo de recursos', 'Para diagnosticar problemas de performance', 'Para monitorar a saúde da instância', 'Para avaliar uso de memória ...

---

## 119. Prompt: "erro 500 na API"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 📊 Resumo Final dos Resultados

**Data/Hora de Conclusão:** 2025-10-01 22:28:40

**Total de Prompts Testados:** 119/120

**Distribuição de Resultados:**
- ✅ Sucessos: 59 (49.6%)
- ❌ Erros: 60 (50.4%)

**Métricas Gerais:**
- Tempo total de execução: 1592.52s
- Tempo médio de resposta: 13.38s
- Taxa de context enhancement: 20.2%

**Status do Teste:** ✅ Concluído com sucesso
## 78. Prompt: "sincronização de dados"

**Métricas:**
- Tempo de resposta: 17.59s
- Context enhancement: Não
- Final score: 0.95

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/sync/{instanceName}', 'name': 'Sincronização de Dados', 'category': 'Sync Controller', 'description': 'Configura as preferências de sincronização de dados da instância WhatsApp', 'purpose': 'Definir quais tipos de dados serão sincronizados e monitorados', 'when_to_use': ['Quando precisar configurar quais eventos serão monitorados', 'Para ajustar as preferências de sincronização da instância', 'Ao iniciar uma nova instância que requer monitoramento especí...

---

## 79. Prompt: "backup automático"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 80. Prompt: "exportar conversas"

**Métricas:**
- Tempo de resposta: 26.57s
- Context enhancement: Sim
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/webhook/logs/export?format={format}&since={since}', 'name': 'Exportar Logs do Webhook', 'category': 'Dual Webhook System - Logs', 'description': 'Endpoint para exportação de logs do sistema de webhook em diferentes formatos', 'purpose': 'Permitir a exportação e backup dos logs de webhook para análise', 'when_to_use': ['Quando precisar fazer backup dos logs', 'Para análise histórica de webhooks', 'Para auditoria de mensagens']}, 'authentication': {'require...

---

## 81. Prompt: "processamento de imagem"

**Métricas:**
- Tempo de resposta: 20.93s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/process/finish', 'name': 'Finalizar Processamento', 'category': 'Processing Feedback System', 'description': 'Endpoint para finalizar e registrar o resultado do processamento de uma mensagem', 'purpose': 'Registrar o resultado final do processamento de uma mensagem, seja sucesso ou erro', 'when_to_use': ['Após concluir o processamento de uma mensagem', 'Quando ocorrer um erro no processamento', 'Para limpar a sessão de processamento']}, 'authentication':...

---

## 82. Prompt: "conversão de áudio"

**Métricas:**
- Tempo de resposta: 25.17s
- Context enhancement: Sim
- Final score: 0.65

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/filters/audio', 'name': 'Consultar Filtros de Áudio', 'category': 'Instance Management - Advanced', 'description': 'Retorna as configurações e estatísticas dos filtros de áudio da instância', 'purpose': 'Obter informações sobre as regras de filtragem de áudio e métricas de uso', 'when_to_use': ['Quando precisar auditar configurações de filtros de áudio', 'Para verificar estatísticas de processamento de áudios', 'Para consultar limi...

---

## 83. Prompt: "thumbnail de vídeo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 84. Prompt: "compressão de arquivo"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 85. Prompt: "análise de conteúdo"

**Métricas:**
- Tempo de resposta: 12.86s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/cleanup/status', 'name': 'Status do Cleanup', 'category': 'S3 Cleanup System', 'description': 'Retorna informações detalhadas sobre o status do sistema de limpeza automática de arquivos', 'purpose': 'Monitorar o estado atual do sistema de limpeza e obter estatísticas de execução', 'when_to_use': ['Quando precisar verificar o status atual do sistema de limpeza', 'Para monitorar estatísticas de execuções anteriores', 'Para verificar próximas execuções agend...

---

## 86. Prompt: "configurar autenticação"

**Métricas:**
- Tempo de resposta: 19.54s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook/Websocket', 'category': 'Webhook/Websocket', 'description': 'Configura os parâmetros de websocket para uma instância específica', 'purpose': 'Permite configurar as opções de websocket como triggers, expiração, mensagens e comportamentos', 'when_to_use': ['Quando precisar configurar a integração via websocket', 'Para definir comportamentos automáticos do websocket', 'Para configurar mensagens e trig...

---

## 87. Prompt: "API key management"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 88. Prompt: "controle de acesso"

**Métricas:**
- Tempo de resposta: 13.76s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar mensagens de status do WhatsApp', 'purpose': 'Permite pesquisar e recuperar mensagens de status específicas', 'when_to_use': ['Quando precisar buscar mensagens de status específicas', 'Para monitorar status postados']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chav...

---

## 89. Prompt: "criptografia de mensagens"

**Métricas:**
- Tempo de resposta: 13.65s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/chat/{instanceName}/mediaBase64/{messageId}', 'name': 'Obter Base64 de Mídia', 'category': 'Chat Controller', 'description': 'Endpoint para obter a codificação base64 de uma mídia enviada em uma mensagem', 'purpose': 'Converter mídia de mensagens em formato base64 para processamento seguro', 'when_to_use': ['Quando precisar acessar o conteúdo de mídia em formato codificado', 'Para armazenamento ou transmissão segura de mídia']}, 'authentication': {'requir...

---

## 90. Prompt: "audit log"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 91. Prompt: "asdfghjkl"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 92. Prompt: "a"

**Métricas:**
- Tempo de resposta: 28.39s
- Context enhancement: Não
- Final score: 0.30

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/', 'name': 'Status da API', 'category': 'API Status', 'description': 'Endpoint para verificar o status e informações básicas da Evolution API', 'purpose': 'Verificar se a API está funcionando e obter links importantes', 'when_to_use': ['Ao verificar se a API está online', 'Para obter a versão atual da API', 'Para acessar links de documentação e gerenciamento']}, 'authentication': {'required': False, 'type': None, 'key': None, 'description': 'Não requer au...

---

## 93. Prompt: "123456789"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 94. Prompt: "!@#$%^&*()"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 95. Prompt: "como fazer um bolo de chocolate"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 96. Prompt: "previsão do tempo"

**Métricas:**
- Tempo de resposta: 15.13s
- Context enhancement: Não
- Final score: 0.16

**Resposta:**
ERRO

---

## 97. Prompt: "receita de lasanha"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 98. Prompt: "como trocar pneu do carro"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 99. Prompt: "qual o melhor smartphone"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 100. Prompt: "xpto endpoint inexistente"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 101. Prompt: "configurar coisa"

**Métricas:**
- Tempo de resposta: 19.97s
- Context enhancement: Não
- Final score: 0.45

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Websocket', 'category': 'Websocket', 'description': 'Configura os parâmetros do websocket para uma instância específica', 'purpose': 'Permite personalizar o comportamento do websocket para recebimento de eventos', 'when_to_use': ['Quando precisar configurar o comportamento do websocket', 'Para definir regras de trigger e expiração', 'Para configurar mensagens automáticas e comportamentos']}, 'authenticatio...

---

## 102. Prompt: "fazer alguma coisa"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 103. Prompt: "api do negócio"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 104. Prompt: "sistema da empresa"

**Métricas:**
- Tempo de resposta: 10.69s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/', 'name': 'Status da API', 'category': 'API Status', 'description': 'Endpoint para verificar o status de funcionamento da API', 'purpose': 'Verificar se a API está online e obter informações básicas do sistema', 'when_to_use': ['Ao verificar se o serviço está disponível', 'Para obter a versão atual da API', 'Para acessar links de documentação e gerenciamento']}, 'authentication': {'required': False, 'type': None, 'key': None, 'description': 'Não requer a...

---

## 105. Prompt: "como instalar linux"

**Métricas:**
- Tempo de resposta: 0.04s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 106. Prompt: "configurar nginx"

**Métricas:**
- Tempo de resposta: 19.58s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Websocket', 'category': 'Websocket', 'description': 'Configura os parâmetros do websocket para uma instância específica', 'purpose': 'Permite configurar comportamentos do websocket como triggers, expiração, mensagens e outros parâmetros', 'when_to_use': ['Quando precisar configurar o comportamento do websocket', 'Para definir triggers e respostas automáticas', 'Para ajustar parâmetros de timeout e debounce...

---

## 107. Prompt: "banco de dados mysql"

**Métricas:**
- Tempo de resposta: 15.71s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/settings/{instanceName}', 'name': 'Configurações de Privacidade', 'category': 'Instance Settings', 'description': 'Endpoint para configurar as definições de privacidade da instância', 'purpose': 'Gerenciar configurações de privacidade e visibilidade', 'when_to_use': ['Ao configurar uma nova instância', 'Ao modificar configurações de privacidade existentes']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': '...

---

## 108. Prompt: "deploy no kubernetes"

**Métricas:**
- Tempo de resposta: 13.25s
- Context enhancement: Não
- Final score: 0.15

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar mensagens de status do WhatsApp', 'purpose': 'Permite pesquisar e recuperar mensagens de status específicas', 'when_to_use': ['Quando precisar buscar mensagens de status específicas', 'Para monitorar status postados']}, 'authentication': {'required': True, 'type': 'header', 'key': 'apikey', 'description': 'Chav...

---

## 109. Prompt: "configurar docker"

**Métricas:**
- Tempo de resposta: 19.12s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/webhook/set/{instanceName}', 'name': 'Configurar Webhook/Websocket', 'category': 'Webhook/Websocket', 'description': 'Configura os parâmetros de websocket para uma instância específica', 'purpose': 'Permite personalizar o comportamento do websocket e definir regras de escuta de mensagens', 'when_to_use': ['Quando precisar configurar a integração via websocket', 'Para definir regras de trigger e comportamento do bot', 'Para configurar delays e timeouts de...

---

## 110. Prompt: "instância não conecta"

**Métricas:**
- Tempo de resposta: 13.82s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/instance/{instanceName}/connect', 'name': 'Conectar Instância', 'category': 'Instance Management - Basic', 'description': 'Endpoint para conectar uma instância do WhatsApp, gerando QR Code se necessário', 'purpose': 'Estabelecer conexão entre a instância e o WhatsApp', 'when_to_use': ['Quando precisar conectar uma instância pela primeira vez', 'Quando a instância estiver desconectada', 'Após um logout para reconectar']}, 'authentication': {'required': Tr...

---

## 111. Prompt: "erro ao enviar mensagem"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 112. Prompt: "webhook não funciona"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 113. Prompt: "problema de autenticação"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 114. Prompt: "timeout na API"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 115. Prompt: "como debugar erros"

**Métricas:**
- Tempo de resposta: 15.01s
- Context enhancement: Não
- Final score: 0.35

**Resposta:**
{'endpoint': {'method': 'POST', 'path': '/chat/findStatusMessage/{instanceName}', 'name': 'Buscar Mensagens de Status', 'category': 'Chat Controller', 'description': 'Endpoint para buscar e filtrar mensagens de status do WhatsApp', 'purpose': 'Permite pesquisar e recuperar mensagens de status específicas', 'when_to_use': ['Quando precisar buscar mensagens de status específicas', 'Para debug de mensagens de status', 'Para auditoria de mensagens']}, 'authentication': {'required': True, 'type': 'he...

---

## 116. Prompt: "logs de erro"

**Métricas:**
- Tempo de resposta: 33.83s
- Context enhancement: Sim
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/webhook/logs?type={type}&instance={instance}&limit={limit}&since={since}', 'name': 'Consultar Logs do Webhook', 'category': 'Dual Webhook System - Logs', 'description': 'Endpoint para consultar logs do sistema de webhooks, incluindo erros e eventos', 'purpose': 'Permitir monitoramento e debug de chamadas webhook', 'when_to_use': ['Quando precisar investigar erros de webhook', 'Para monitorar entregas de eventos', 'Para auditoria de chamadas webhook']}, 'a...

---

## 117. Prompt: "troubleshooting de conexão"

**Métricas:**
- Tempo de resposta: 14.80s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/connectionState', 'name': 'Estado da Conexão', 'category': 'Instance Management - Basic', 'description': 'Retorna o estado atual de conexão da instância WhatsApp, incluindo detalhes do perfil quando conectado', 'purpose': 'Verificar status de conexão e troubleshooting', 'when_to_use': ['Quando precisar verificar se a instância está conectada', 'Durante troubleshooting de problemas de conexão', 'Para monitoramento do estado da instâ...

---

## 118. Prompt: "resolver problema de performance"

**Métricas:**
- Tempo de resposta: 14.00s
- Context enhancement: Não
- Final score: 0.85

**Resposta:**
{'endpoint': {'method': 'GET', 'path': '/instance/{instanceName}/metrics', 'name': 'Métricas da Instância', 'category': 'Instance Management - Advanced', 'description': 'Retorna métricas detalhadas de performance e uso da instância WhatsApp', 'purpose': 'Monitorar e diagnosticar problemas de performance da instância', 'when_to_use': ['Quando precisar analisar o consumo de recursos (CPU, memória)', 'Para investigar problemas de performance', 'Para monitorar métricas de mensagens e conexão', 'Para...

---

## 119. Prompt: "erro 500 na API"

**Métricas:**
- Tempo de resposta: 0.03s
- Context enhancement: Não
- Final score: 0.00

**Resposta:**
ERRO

---

## 📊 Resumo Final dos Resultados

**Data/Hora de Conclusão:** 2025-10-01 22:35:09

**Total de Prompts Testados:** 119/120

**Distribuição de Resultados:**
- ✅ Sucessos: 59 (49.6%)
- ❌ Erros: 60 (50.4%)

**Métricas Gerais:**
- Tempo total de execução: 1594.33s
- Tempo médio de resposta: 13.40s
- Taxa de context enhancement: 20.2%

**Status do Teste:** ✅ Concluído com sucesso
