# Evolution API Lite - Sistema de Fila Global

## 📖 Documentação Técnica

Esta pasta contém a documentação completa do **Sistema de Fila Global com Rate Limiting** implementado na Evolution API Lite.

### 📚 Estrutura da Documentação

- **[API Reference](./api-reference.md)** - Documentação completa dos endpoints
- **[Setup & Configuration](./setup-configuration.md)** - Guia de instalação e configuração
- **[Architecture](./architecture.md)** - Arquitetura do sistema e fluxos
- **[Operations & Monitoring](./operations-monitoring.md)** - Operação e monitoramento
- **[Troubleshooting](./troubleshooting.md)** - Solução de problemas

### 🎯 Sobre o Sistema

O sistema implementa uma arquitetura robusta para gerenciar eventos WhatsApp de 500 instâncias simultâneas com:

- **Filtros por duração de áudio** (3 segundos a 5 minutos, configurável por instância)
- **Upload S3-only** (sem downloads locais por segurança)
- **Fila RabbitMQ global** com rate limiting (500 msg/minuto padrão)
- **Dual webhook system** (dados principais + monitoramento separado)
- **Zero persistência local** de dados de áudio (máxima segurança)
- **100% compatibilidade** com estrutura Evolution API existente

### ⚡ Quick Start

1. **Configuração básica**: Veja [Setup & Configuration](./setup-configuration.md)
2. **Endpoints principais**: Consulte [API Reference](./api-reference.md)
3. **Monitoramento**: Configure conforme [Operations & Monitoring](./operations-monitoring.md)

### 🔧 Componentes Principais

- **Token Bucket Rate Limiting** - Controle de taxa de mensagens
- **Global Queue RabbitMQ** - Fila unificada para todas as instâncias
- **Audio Duration Filters** - Filtros configuráveis por instância
- **S3 Auto Cleanup** - Limpeza automática de arquivos antigos
- **Processing Feedback System** - Feedback visual em tempo real
- **Global Webhook Configuration** - Configuração centralizada de webhooks

### 🚀 Status de Implementação

- ✅ **Sprint 1**: Rate Limiting & Token Bucket
- ✅ **Sprint 2**: Core Logic & Webhooks
- ✅ **Sprint 3**: Integração & Testes
- ✅ **Dia 8**: Documentação Técnica

---

**Versão**: 2.2.1
**Última atualização**: Outubro 2025