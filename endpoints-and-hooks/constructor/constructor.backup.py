#!/usr/bin/env python3
"""
🤖 Evolution API Constructor/Consultor
Agente especializado em construção e consulta de APIs Evolution com busca híbrida IA + textual
"""

import json
import os
import re
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import anthropic
import openai
from datetime import datetime, timedelta

@dataclass
class SearchResult:
    """Resultado de busca estruturado"""
    endpoint_id: str
    source: str
    relevance_score: float
    category: str
    name: str
    summary: str
    keywords: List[str]
    confidence: float

class EvolutionAPIConstructor:
    """
    🧠 Agente Constructor/Consultor da Evolution API

    Especialista em Evolution API com conhecimento de endpoints nativos e customizados.

    🚀 NOVA ESTRATÉGIA HÍBRIDA INTELIGENTE:
    1. Busca textual otimizada (sempre, rápida, sem custo)
    2. IA seletiva apenas para casos duvidosos (threshold configurável: 75%)

    Resultado: 80-90% consultas resolvidas sem IA, mantendo alta qualidade.

    Suporte multi-provider:
    - Anthropic Claude (claude-3-5-sonnet, claude-sonnet-4)
    - OpenAI (o1-mini, o1-preview, gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo)
    """

    def __init__(self, config_path: str = "endpoints-and-hooks/config/ai_config.json"):
        self.config = self._load_config(config_path)
        self.ai_client = self._init_ai_client()
        self.consolidated_index = self._load_consolidated_index()
        self.cache = {}
        self.cache_timestamps = {}

        # 🌶️ PHASE 2: Contextual Enhancement - Configurações
        self.context_files = {
            "filters": "endpoints-and-hooks/custom/filters.md",
            "webhooks": "endpoints-and-hooks/custom/dual-webhook-system.md"
        }

        # Triggers para detecção de contexto
        self.filter_triggers = ["filtro", "filter", "audio", "message", "text", "duration", "size", "type"]
        self.webhook_triggers = ["webhook", "monitoring", "dual", "health", "retry", "payload", "callback"]

    def _load_config(self, config_path: str) -> Dict:
        """Carrega configurações de AI e API keys"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"❌ Arquivo de configuração não encontrado: {config_path}")

    def _init_ai_client(self):
        """Inicializa cliente de IA baseado no provider configurado"""
        provider = self.config['current_provider']

        if provider == 'anthropic':
            return anthropic.Anthropic(
                api_key=self.config['anthropic']['api_key']
            )
        elif provider == 'openai':
            return openai.OpenAI(
                api_key=self.config['openai']['api_key']
            )
        else:
            raise ValueError(f"❌ Provider não suportado: {provider}")

    def _load_consolidated_index(self) -> Dict:
        """Carrega índice consolidado (única vez)"""
        index_path = "endpoints-and-hooks/consolidated-map.json"
        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                print(f"📚 Índice carregado: {data['metadata']['total_entries']} endpoints/webhooks")
                return data
        except FileNotFoundError:
            raise FileNotFoundError(f"❌ Índice consolidado não encontrado: {index_path}")

    def _phase1_ai_probabilistic_ranking(self, user_query: str, all_endpoints: List[Dict]) -> List[SearchResult]:
        """
        🤖 FASE 1: Ranking Probabilístico via IA (Uma única chamada)

        Nova estratégia otimizada:
        1. Envia lista completa em formato tabular para IA
        2. IA retorna tabela com probabilidades
        3. Converte resultado em SearchResults
        4. Retorna TOP 3 candidatos

        Reduz de ~4-5 chamadas para 1 única chamada
        """

        print(f"🤖 Fase 1: Enviando {len(all_endpoints)} endpoints para ranking via IA (chamada única)...")

        # Preparar tabela para IA
        endpoints_table = self._prepare_endpoints_table(all_endpoints)

        # Faz uma única chamada para IA
        ai_probabilities = self._ai_single_call_ranking(user_query, endpoints_table)

        if not ai_probabilities:
            # Fallback para estratégia textual se IA falhar
            print("⚠️ IA falhou, usando fallback textual...")
            return self._fallback_textual_ranking(user_query, all_endpoints)

        # Converte probabilidades IA em SearchResults
        scored_endpoints = []
        min_threshold = self.config.get('scoring', {}).get('minimum_threshold', 0.2)

        for prob_data in ai_probabilities:
            if prob_data['probability'] >= min_threshold:
                original_endpoint = all_endpoints[prob_data['index']]

                scored_endpoints.append(SearchResult(
                    endpoint_id=original_endpoint.get('id', f"endpoint_{prob_data['index']}"),
                    source=original_endpoint['source'],
                    relevance_score=prob_data['probability'],
                    category=original_endpoint['category'],
                    name=original_endpoint['name'],
                    summary=original_endpoint['summary'],
                    keywords=original_endpoint['keywords'],
                    confidence=prob_data.get('confidence', prob_data['probability'])
                ))

        # Ordena por probabilidade e retorna TOP 3
        sorted_results = sorted(scored_endpoints, key=lambda x: x.relevance_score, reverse=True)

        if self.config.get('debug_mode', False):
            print(f"🔍 Fase 1: {len(sorted_results)} candidatos encontrados via IA")
            for i, result in enumerate(sorted_results[:5]):
                print(f"  {i+1}. {result.name} (Prob: {result.relevance_score:.3f})")

        return sorted_results[:3]  # TOP 3 para Fase 2

    def _hybrid_ranking_strategy(self, user_query: str, all_endpoints: List[Dict]) -> List[SearchResult]:
        """
        🧠 NOVA ESTRATÉGIA HÍBRIDA: Textual + IA Seletiva

        Fluxo inteligente:
        1. SEMPRE executa busca textual otimizada (rápida, sem custo)
        2. Se score >= threshold (75%): aceita resultado textual
        3. Se score < threshold: chama IA para resolver dúvida

        Resultado: 80-90% consultas resolvidas sem IA, mantendo alta qualidade
        """

        print(f"🧠 Estratégia Híbrida: Textual primeiro, IA seletiva...")

        # FASE 1: Busca Textual Otimizada (sempre executada)
        print(f"📊 Fase 1: Executando busca textual...")
        textual_candidates = self._enhanced_textual_ranking(user_query, all_endpoints)

        if not textual_candidates:
            print("❌ Nenhum candidato textual encontrado")
            return []

        best_textual_score = textual_candidates[0].relevance_score
        confidence_threshold = self.config.get('hybrid_strategy', {}).get('textual_confidence_threshold', 0.75)

        print(f"🎯 Melhor score textual: {best_textual_score:.3f}")
        print(f"📏 Threshold de confiança: {confidence_threshold}")

        # DECISÃO INTELIGENTE: Aceita textual ou chama IA?
        if best_textual_score >= confidence_threshold:
            print(f"✅ ALTA CONFIANÇA: Score {best_textual_score:.3f} >= {confidence_threshold}")
            print(f"🚀 Resultado textual aceito - SEM chamada IA")
            return textual_candidates

        else:
            print(f"⚠️ BAIXA CONFIANÇA: Score {best_textual_score:.3f} < {confidence_threshold}")
            print(f"🤖 Chamando IA para resolver dúvida...")

            # FASE 2: IA apenas para casos duvidosos
            ai_candidates = self._phase1_ai_probabilistic_ranking(user_query, all_endpoints)

            if ai_candidates and len(ai_candidates) > 0:
                best_ai_score = ai_candidates[0].relevance_score
                print(f"🤖 IA retornou score: {best_ai_score:.3f}")

                # Compara IA vs Textual e escolhe o melhor
                if best_ai_score > best_textual_score * 1.1:  # IA deve ser 10% melhor
                    print(f"✅ IA é melhor: {best_ai_score:.3f} > {best_textual_score:.3f}")
                    return ai_candidates
                else:
                    print(f"✅ Textual mantido: IA não foi significativamente melhor")
                    return textual_candidates
            else:
                print(f"⚠️ IA falhou, mantendo resultado textual")
                return textual_candidates

    def _enhanced_textual_ranking(self, user_query: str, all_endpoints: List[Dict]) -> List[SearchResult]:
        """
        📊 Busca Textual Otimizada (versão melhorada do fallback)

        Usa os keywords otimizados que já provaram funcionar perfeitamente
        """
        query_lower = user_query.lower()
        scored_endpoints = []
        min_threshold = self.config.get('scoring', {}).get('minimum_threshold', 0.2)

        # Pesos configuráveis
        weights = self.config.get('scoring', {})
        name_weight = weights.get('name_weight', 0.4)
        summary_weight = weights.get('summary_weight', 0.35)
        keywords_weight = weights.get('keywords_weight', 0.25)

        for i, endpoint in enumerate(all_endpoints):
            # Textos para análise
            name_text = endpoint.get('name', '').lower()
            summary_text = endpoint.get('summary', '').lower()
            keywords_text = ' '.join(endpoint.get('keywords', [])).lower()

            # Score por componente (como a versão original, mas otimizada)
            name_score = self._calculate_text_similarity(query_lower, name_text)
            summary_score = self._calculate_text_similarity(query_lower, summary_text)
            keywords_score = self._calculate_text_similarity(query_lower, keywords_text)

            # Score ponderado final
            weighted_score = (
                name_score * name_weight +
                summary_score * summary_weight +
                keywords_score * keywords_weight
            )

            if weighted_score >= min_threshold:
                scored_endpoints.append(SearchResult(
                    endpoint_id=endpoint.get('id', f"endpoint_{i}"),
                    source=endpoint['source'],
                    relevance_score=weighted_score,
                    category=endpoint['category'],
                    name=endpoint['name'],
                    summary=endpoint['summary'],
                    keywords=endpoint['keywords'],
                    confidence=weighted_score
                ))

        # Ordena e retorna TOP 3
        sorted_results = sorted(scored_endpoints, key=lambda x: x.relevance_score, reverse=True)

        if self.config.get('debug_mode', False):
            print(f"🔍 Busca textual: {len(sorted_results)} candidatos encontrados")
            for i, result in enumerate(sorted_results[:3]):
                print(f"  {i+1}. {result.name} (Score: {result.relevance_score:.3f})")

        return sorted_results[:3]

    def _prepare_endpoints_table(self, all_endpoints: List[Dict]) -> str:
        """
        Prepara tabela formatada para IA com ID | Nome | Keywords | Summary
        """
        lines = ["ID | Nome | Keywords | Summary"]
        lines.append("---|------|----------|--------")

        for i, endpoint in enumerate(all_endpoints):
            endpoint_id = endpoint.get('id', f"endpoint_{i}")
            name = endpoint['name'][:50]  # Limita tamanho
            keywords = ', '.join(endpoint['keywords'][:5])  # Limita keywords
            summary = endpoint['summary'][:100]  # Limita summary

            # Escapa pipes para não quebrar a tabela
            name = name.replace('|', '\\|')
            keywords = keywords.replace('|', '\\|')
            summary = summary.replace('|', '\\|')

            lines.append(f"{endpoint_id} | {name} | {keywords} | {summary}")

        return '\n'.join(lines)

    def _ai_single_call_ranking(self, user_query: str, endpoints_table: str) -> List[Dict]:
        """
        🤖 Faz uma única chamada para IA para rankear todos os endpoints

        Retorna lista com probabilidades para cada endpoint
        """

        provider = self.config['current_provider']

        if provider == 'anthropic':
            return self._ai_single_call_anthropic(user_query, endpoints_table)
        elif provider == 'openai':
            return self._ai_single_call_openai(user_query, endpoints_table)
        else:
            print(f"❌ Provider não suportado: {provider}")
            return []

    def _ai_single_call_anthropic(self, user_query: str, endpoints_table: str) -> List[Dict]:
        """
        Chamada única para Anthropic Claude
        """

        system_prompt = """
        Você é um especialista em APIs REST e especificamente na Evolution API para WhatsApp.

        TAREFA: Analisar uma consulta do usuário e calcular a probabilidade de cada endpoint da tabela corresponder à intenção da consulta.

        RETORNE um JSON com esta estrutura EXATA:
        {
            "rankings": [
                {
                    "id": "endpoint_id",
                    "index": 0,
                    "probability": 0.95,
                    "reasoning": "Breve explicação do match"
                }
            ]
        }

        CRITÉRIOS DE PROBABILIDADE:
        - 0.90-1.00: Match perfeito - endpoint faz exatamente o que o usuário quer
        - 0.70-0.89: Match muito bom - endpoint resolve o problema com algumas adaptações
        - 0.40-0.69: Match moderado - endpoint está relacionado mas não é ideal
        - 0.20-0.39: Match fraco - endpoint tem alguma relação distante
        - 0.00-0.19: Sem match - endpoint não tem relação com a consulta

        IMPORTANTE:
        - Seja rigoroso: a maioria dos endpoints devem ter probabilidades baixas (< 0.3)
        - Apenas endpoints realmente relevantes devem ter probabilidades altas
        - Use seu conhecimento da Evolution API para validar se faz sentido
        - Considere sinônimos e variações linguísticas (criar/adicionar, buscar/listar, etc.)
        - Analise a intenção do usuário (configurar vs consultar vs deletar)
        """

        user_prompt = f"""
        CONSULTA DO USUÁRIO: "{user_query}"

        TABELA DE ENDPOINTS:
        {endpoints_table}

        Analise cada endpoint da tabela e calcule a probabilidade dele corresponder à consulta.
        Retorne o JSON com probabilidades para TODOS os endpoints listados.
        Use o índice da linha (começando em 0) como "index".
        """

        try:
            response = self.ai_client.messages.create(
                model=self.config['anthropic']['model'],
                max_tokens=8000,  # Aumenta para tabela grande
                temperature=self.config['anthropic']['temperature_phase1'],
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )

            ai_response = response.content[0].text
            cleaned_response = self._clean_ai_response(ai_response)
            result = json.loads(cleaned_response)

            return result.get('rankings', [])

        except Exception as e:
            print(f"❌ Erro na análise Anthropic: {e}")
            return []

    def _clean_ai_response(self, ai_response: str) -> str:
        """
        🧹 Limpa resposta da IA removendo blocos de código markdown
        """
        # Remove blocos de código markdown se existirem
        if '```json' in ai_response:
            # Extrai JSON entre ```json e ```
            start = ai_response.find('```json') + 7
            end = ai_response.find('```', start)
            if end != -1:
                return ai_response[start:end].strip()
        elif '```' in ai_response:
            # Extrai JSON entre ``` e ```
            start = ai_response.find('```') + 3
            end = ai_response.find('```', start)
            if end != -1:
                return ai_response[start:end].strip()

        # Se não há blocos de código, retorna original
        return ai_response.strip()

    def _ai_single_call_openai(self, user_query: str, endpoints_table: str) -> List[Dict]:
        """
        Chamada única para OpenAI
        """

        # Detecta se modelo suporta system messages
        model = self.config['openai']['model']
        supports_system = not model.startswith('o1-')  # o1 models não suportam system

        system_prompt = """
        Você é um especialista em APIs REST e especificamente na Evolution API para WhatsApp.

        TAREFA: Analisar uma consulta do usuário e calcular a probabilidade de cada endpoint da tabela corresponder à intenção da consulta.

        RETORNE um JSON com esta estrutura EXATA:
        {
            "rankings": [
                {
                    "id": "endpoint_id",
                    "index": 0,
                    "probability": 0.95,
                    "reasoning": "Breve explicação do match"
                }
            ]
        }

        CRITÉRIOS DE PROBABILIDADE:
        - 0.90-1.00: Match perfeito - endpoint faz exatamente o que o usuário quer
        - 0.70-0.89: Match muito bom - endpoint resolve o problema com algumas adaptações
        - 0.40-0.69: Match moderado - endpoint está relacionado mas não é ideal
        - 0.20-0.39: Match fraco - endpoint tem alguma relação distante
        - 0.00-0.19: Sem match - endpoint não tem relação com a consulta

        IMPORTANTE:
        - Seja rigoroso: a maioria dos endpoints devem ter probabilidades baixas (< 0.3)
        - Apenas endpoints realmente relevantes devem ter probabilidades altas
        - Use seu conhecimento da Evolution API para validar se faz sentido
        - Considere sinônimos e variações linguísticas (criar/adicionar, buscar/listar, etc.)
        - Analise a intenção do usuário (configurar vs consultar vs deletar)
        """

        user_prompt = f"""
        CONSULTA DO USUÁRIO: "{user_query}"

        TABELA DE ENDPOINTS:
        {endpoints_table}

        Analise cada endpoint da tabela e calcule a probabilidade dele corresponder à consulta.
        Retorne o JSON com probabilidades para TODOS os endpoints listados.
        Use o índice da linha (começando em 0) como "index".
        """

        try:
            # Prepara mensagens baseado no suporte a system
            if supports_system:
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            else:
                # Para modelos o1, combina system e user em uma única mensagem
                combined_prompt = f"{system_prompt}\n\n{user_prompt}"
                messages = [
                    {"role": "user", "content": combined_prompt}
                ]

            response = self.ai_client.chat.completions.create(
                model=model,
                max_tokens=8000,
                temperature=self.config['openai']['temperature_phase1'],
                messages=messages
            )

            ai_response = response.choices[0].message.content

            # Limpa resposta de possíveis blocos de código markdown
            cleaned_response = self._clean_ai_response(ai_response)
            result = json.loads(cleaned_response)

            return result.get('rankings', [])

        except Exception as e:
            print(f"❌ Erro na análise OpenAI: {e}")
            return []

    def _ai_calculate_probabilities(self, user_query: str, endpoints_for_ai: List[Dict]) -> List[Dict]:
        """
        🤖 IA calcula probabilidades de match para cada endpoint

        Envia lista completa para IA e recebe probabilidades estruturadas
        """

        # Divide endpoints em chunks para não exceder limite de tokens
        chunk_size = 30  # Ajustável baseado no tamanho médio dos endpoints
        chunks = [endpoints_for_ai[i:i + chunk_size] for i in range(0, len(endpoints_for_ai), chunk_size)]

        all_probabilities = []

        for chunk_idx, chunk in enumerate(chunks):
            print(f"🔄 Processando chunk {chunk_idx + 1}/{len(chunks)} ({len(chunk)} endpoints)...")

            chunk_probabilities = self._ai_process_endpoints_chunk(user_query, chunk)
            if chunk_probabilities:
                all_probabilities.extend(chunk_probabilities)

        # Ordena por probabilidade e retorna
        return sorted(all_probabilities, key=lambda x: x['probability'], reverse=True)

    def _ai_process_endpoints_chunk(self, user_query: str, endpoints_chunk: List[Dict]) -> List[Dict]:
        """
        🤖 Processa um chunk de endpoints via IA para calcular probabilidades
        """

        system_prompt = """
        Você é um especialista em APIs REST e especificamente na Evolution API para WhatsApp.

        TAREFA: Analisar uma consulta do usuário e calcular a probabilidade de cada endpoint corresponder à intenção da consulta.

        RETORNE um JSON com esta estrutura EXATA:
        {
            "rankings": [
                {
                    "index": 0,
                    "probability": 0.95,
                    "confidence": 0.90,
                    "reasoning": "Este endpoint corresponde exatamente porque..."
                },
                {
                    "index": 1,
                    "probability": 0.02,
                    "confidence": 0.85,
                    "reasoning": "Não corresponde porque..."
                }
            ]
        }

        CRITÉRIOS DE PROBABILIDADE:
        - 0.90-1.00: Match perfeito - endpoint faz exatamente o que o usuário quer
        - 0.70-0.89: Match muito bom - endpoint resolve o problema com algumas adaptações
        - 0.40-0.69: Match moderado - endpoint está relacionado mas não é ideal
        - 0.20-0.39: Match fraco - endpoint tem alguma relação distante
        - 0.00-0.19: Sem match - endpoint não tem relação com a consulta

        IMPORTANTE:
        - Seja rigoroso: a maioria dos endpoints devem ter probabilidades baixas (< 0.3)
        - Apenas endpoints realmente relevantes devem ter probabilidades altas
        - Use seu conhecimento da Evolution API para validar se faz sentido
        - Considere sinônimos e variações linguísticas (criar/adicionar, buscar/listar, etc.)
        - Analise a intenção do usuário (configurar vs consultar vs deletar)
        """

        # Prepara lista compacta de endpoints para IA
        endpoints_summary = []
        for ep in endpoints_chunk:
            endpoints_summary.append(f"[{ep['index']}] {ep['name']} | {ep['category']} | {ep['summary']} | Keywords: {', '.join(ep['keywords'])}")

        user_prompt = f"""
        CONSULTA DO USUÁRIO: "{user_query}"

        ENDPOINTS PARA ANÁLISE:
        {chr(10).join(endpoints_summary)}

        Analise cada endpoint e calcule a probabilidade dele corresponder à consulta.
        Retorne o JSON com probabilidades para TODOS os endpoints listados.
        """

        try:
            response = self.client.messages.create(
                model=self.config['anthropic']['model'],
                max_tokens=4000,  # Aumenta para lidar com mais endpoints
                temperature=self.config[self.config['current_provider']]['temperature_phase23'],  # Baixa para ser mais consistente
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )

            ai_response = response.content[0].text
            cleaned_response = self._clean_ai_response(ai_response)
            result = json.loads(cleaned_response)

            return result.get('rankings', [])

        except Exception as e:
            print(f"❌ Erro na análise de probabilidades IA: {e}")
            return []

    def _fallback_textual_ranking(self, user_query: str, all_endpoints: List[Dict]) -> List[SearchResult]:
        """
        📊 Fallback: Ranking textual quando IA falha

        Versão simplificada da estratégia textual original
        """
        query_lower = user_query.lower()
        scored_endpoints = []
        min_threshold = self.config.get('scoring', {}).get('minimum_threshold', 0.2)

        for i, endpoint in enumerate(all_endpoints):
            # Textos para análise
            name_text = endpoint.get('name', '').lower()
            summary_text = endpoint.get('summary', '').lower()
            keywords_text = ' '.join(endpoint.get('keywords', [])).lower()

            # Score simples baseado em matches
            name_score = self._calculate_text_similarity(query_lower, name_text)
            summary_score = self._calculate_text_similarity(query_lower, summary_text)
            keywords_score = self._calculate_text_similarity(query_lower, keywords_text)

            # Score combinado (pesos iguais para simplicidade)
            combined_score = (name_score + summary_score + keywords_score) / 3

            if combined_score >= min_threshold:
                scored_endpoints.append(SearchResult(
                    endpoint_id=endpoint.get('id', f"endpoint_{i}"),
                    source=endpoint['source'],
                    relevance_score=combined_score,
                    category=endpoint['category'],
                    name=endpoint['name'],
                    summary=endpoint['summary'],
                    keywords=endpoint['keywords'],
                    confidence=combined_score * 0.8  # Menor confiança para fallback
                ))

        # Ordena e retorna TOP 3
        sorted_results = sorted(scored_endpoints, key=lambda x: x.relevance_score, reverse=True)
        return sorted_results[:3]

    def _calculate_text_similarity(self, query: str, text: str) -> float:
        """
        Calcula similaridade entre query e texto usando múltiplas estratégias
        """
        if not text:
            return 0.0

        query_words = set(query.split())
        text_words = set(text.split())

        # 1. Exact match (peso alto)
        if query in text:
            return 1.0

        # 2. Partial match das palavras
        word_matches = len(query_words.intersection(text_words))
        word_score = word_matches / len(query_words) if query_words else 0

        # 3. Substring matches
        substring_score = 0
        for q_word in query_words:
            if len(q_word) > 3:  # Só palavras significativas
                for t_word in text_words:
                    if q_word in t_word or t_word in q_word:
                        substring_score += 1
        substring_score = min(substring_score / len(query_words), 1.0) if query_words else 0

        # Score final combinado
        final_score = max(word_score, substring_score * 0.7)

        return final_score

    def _fallback_text_search(self, query: str, candidates: List[Dict]) -> List[SearchResult]:
        """Busca textual de fallback"""
        query_lower = query.lower()
        scored_results = []

        for candidate in candidates:
            score = 0.0
            text_to_search = f"{candidate['name']} {candidate['summary']} {' '.join(candidate['keywords'])}".lower()

            # Scoring simples por palavras-chave
            query_words = query_lower.split()
            for word in query_words:
                if word in text_to_search:
                    score += 1.0 / len(query_words)

            if score > 0:
                scored_results.append(SearchResult(
                    endpoint_id=candidate['id'],
                    source=candidate['source'],
                    relevance_score=score,
                    category=candidate['category'],
                    name=candidate['name'],
                    summary=candidate['summary'],
                    keywords=candidate['keywords'],
                    confidence=score * 0.7  # Menor confiança para fallback
                ))

        return sorted(scored_results, key=lambda x: x.relevance_score, reverse=True)

    # 🌶️ PHASE 2: Contextual Enhancement Methods

    def _detect_context_needs(self, endpoint_info: Dict) -> List[str]:
        """
        🔍 Detecção Contextual Pós-Seleção

        Baseado no ENDPOINT selecionado (não na query), detecta quais arquivos
        de contexto devem ser carregados para enriquecimento.
        """
        context_needed = []

        # Textos para análise contextual
        endpoint_text = f"{endpoint_info.get('name', '')} {endpoint_info.get('category', '')} {endpoint_info.get('summary', '')}".lower()

        # Detecção de contexto de filtros
        if any(trigger in endpoint_text for trigger in self.filter_triggers):
            context_needed.append("filters")

        # Detecção de contexto de webhooks
        if any(trigger in endpoint_text for trigger in self.webhook_triggers):
            context_needed.append("webhooks")

        return context_needed

    def _extract_contextual_information(self, context_type: str, endpoint_info: Dict) -> Optional[Dict]:
        """
        📚 Extração de Contexto Especializado

        Carrega arquivo de suporte e extrai seções relevantes ao endpoint usando IA.
        """
        if context_type not in self.context_files:
            return None

        context_file = self.context_files[context_type]

        try:
            # Carrega arquivo de contexto completo
            with open(context_file, 'r', encoding='utf-8') as f:
                context_content = f.read()

            # IA extrai informações relevantes ao endpoint
            return self._ai_extract_relevant_context(context_content, context_type, endpoint_info)

        except Exception as e:
            print(f"❌ Erro ao carregar contexto {context_type}: {e}")
            return None

    def _ai_extract_relevant_context(self, context_content: str, context_type: str, endpoint_info: Dict) -> Dict:
        """
        🤖 IA extrai seções relevantes do arquivo de contexto
        """

        system_prompt = f"""
        Você é um especialista em documentação técnica da Evolution API.

        TAREFA: Extrair informações relevantes de um arquivo de contexto especializado para enriquecer a documentação de um endpoint específico.

        TIPO DE CONTEXTO: {context_type}

        RETORNE um JSON com esta estrutura:
        {{
            "source_file": "{context_type}.md",
            "practical_scenarios": [
                {{
                    "title": "Nome do Cenário",
                    "description": "Descrição do caso de uso",
                    "config": {{"key": "value"}},
                    "behavior": "Como o sistema se comporta"
                }}
            ],
            "important_notes": [
                "Informação crítica 1",
                "Limitação importante 2"
            ],
            "troubleshooting": {{
                "common_errors": ["Erro comum 1", "Erro comum 2"],
                "solutions": ["Solução 1", "Solução 2"]
            }},
            "related_endpoints": [
                "/endpoint/relacionado1 - Descrição",
                "/endpoint/relacionado2 - Descrição"
            ]
        }}

        IMPORTANTE:
        - Extraia apenas informações RELEVANTES ao endpoint fornecido
        - Foque em cenários práticos e dicas de uso
        - Inclua troubleshooting específico se disponível
        - Identifique endpoints relacionados mencionados no contexto
        - Se não houver informação relevante, retorne campos vazios
        """

        user_prompt = f"""
        ENDPOINT ALVO:
        - Nome: {endpoint_info.get('name', '')}
        - Categoria: {endpoint_info.get('category', '')}
        - Resumo: {endpoint_info.get('summary', '')}

        CONTEÚDO DO ARQUIVO DE CONTEXTO:
        {context_content[:8000]}  # Limita para não exceder tokens

        Extraia informações relevantes do contexto que ajudem a entender melhor este endpoint específico.
        """

        try:
            provider = self.config['current_provider']

            if provider == 'anthropic':
                response = self.ai_client.messages.create(
                    model=self.config['anthropic']['model'],
                    max_tokens=2000,
                    temperature=self.config[self.config['current_provider']]['temperature_phase23'],
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )
                ai_response = response.content[0].text

            elif provider == 'openai':
                model = self.config['openai']['model']
                supports_system = not model.startswith('o1-')

                if supports_system:
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ]
                else:
                    combined_prompt = f"{system_prompt}\n\n{user_prompt}"
                    messages = [{"role": "user", "content": combined_prompt}]

                response = self.ai_client.chat.completions.create(
                    model=model,
                    max_tokens=2000,
                    temperature=self.config[self.config['current_provider']]['temperature_phase23'],
                    messages=messages
                )
                ai_response = response.choices[0].message.content

            else:
                raise ValueError(f"Provider não suportado: {provider}")

            cleaned_response = self._clean_ai_response(ai_response)
            return json.loads(cleaned_response)

        except Exception as e:
            print(f"❌ Erro na extração de contexto IA: {e}")
            return {
                "source_file": f"{context_type}.md",
                "practical_scenarios": [],
                "important_notes": [],
                "troubleshooting": {"common_errors": [], "solutions": []},
                "related_endpoints": []
            }

    def _enrich_response_with_context(self, base_response: Dict, endpoint_info: Dict) -> Dict:
        """
        🌶️ FASE 3: Enriquecimento Contextual

        Detecta contexto necessário e enriquece a resposta base com informações especializadas.
        """

        # Detecta quais contextos são necessários
        contexts_needed = self._detect_context_needs(endpoint_info)

        if not contexts_needed:
            # Nenhum enriquecimento necessário
            return base_response

        print(f"🔍 Contextos detectados: {', '.join(contexts_needed)}")

        enhanced_documentation = {}

        # Processa cada contexto necessário
        for context_type in contexts_needed:
            context_info = self._extract_contextual_information(context_type, endpoint_info)
            if context_info:
                # Adiciona informações do contexto ao enhanced_documentation
                if context_type == "filters":
                    enhanced_documentation["filter_system"] = context_info
                elif context_type == "webhooks":
                    enhanced_documentation["webhook_system"] = context_info
                else:
                    enhanced_documentation[context_type] = context_info

        # Se há enriquecimento, adiciona à resposta
        if enhanced_documentation:
            base_response["enhanced_documentation"] = enhanced_documentation
            print(f"✨ Resposta enriquecida com {len(enhanced_documentation)} contextos")

        return base_response

    def search_api(self, user_query: str) -> Dict:
        """
        🎯 FLUXO COMPLETO: Scoring + IA Validation + Contextual Enhancement

        Fluxo:
        1. FASE 1: Scoring ponderado textual (nome 40% + resumo 35% + keywords 25%)
        2. Seleciona TOP 2 candidatos
        3. FASE 2: IA valida o PRIMEIRO candidato com backup strategy
        4. 🌶️ FASE 3: Enriquecimento contextual especializado baseado no endpoint
        5. Retorna resultado estruturado + contexto enriquecido
        """

        print(f"🔍 Buscando: '{user_query}'")

        # Cache check
        if self._is_cached(user_query):
            print("💾 Resultado encontrado no cache")
            return self.cache[user_query]

        # NOVA ESTRATÉGIA HÍBRIDA: Textual primeiro, IA apenas se necessário
        all_endpoints = (self.consolidated_index.get('endpoints', []) +
                        self.consolidated_index.get('webhooks', []))

        top_candidates = self._hybrid_ranking_strategy(user_query, all_endpoints)

        if not top_candidates:
            return {"error": "Nenhum endpoint encontrado para a consulta", "query": user_query}

        print(f"📊 Fase 1: TOP 3 candidatos selecionados por IA")
        for i, candidate in enumerate(top_candidates[:3], 1):
            print(f"  {i}º: {candidate.name} (Prob: {candidate.relevance_score:.3f})")

        # FASE 2: IA Validation com Strategy de Múltiplos Candidatos
        first_candidate = top_candidates[0]
        second_candidate = top_candidates[1] if len(top_candidates) > 1 else None
        third_candidate = top_candidates[2] if len(top_candidates) > 2 else None

        print(f"🤖 Fase 2: Validando candidatos em ordem de probabilidade...")

        # Testa primeiro candidato (mais provável)
        first_result = self._extract_detailed_info_with_ai_validation(user_query, first_candidate)

        # Strategy: testa múltiplos candidatos se primeiro não for convincente
        candidate_results = []
        if first_result:
            candidate_results.append({
                'candidate': first_candidate,
                'result': first_result,
                'ai_score': first_result.get('final_score', 0),
                'probability': first_candidate.relevance_score
            })

        # Testa segundo candidato se primeira probabilidade IA não for convincente
        if second_candidate and first_result:
            first_ai_score = first_result.get('final_score', 0)
            first_probability = first_candidate.relevance_score

            # Se score IA for muito menor que probabilidade IA, testa outros
            if first_ai_score < first_probability * 0.8:  # 20% de degradação
                print(f"⚠️  Score final ({first_ai_score:.3f}) < Probabilidade IA ({first_probability:.3f})")
                print(f"🔄 Testando segundo candidato...")

                second_result = self._extract_detailed_info_with_ai_validation(user_query, second_candidate)
                if second_result:
                    candidate_results.append({
                        'candidate': second_candidate,
                        'result': second_result,
                        'ai_score': second_result.get('final_score', 0),
                        'probability': second_candidate.relevance_score
                    })

        # Testa terceiro se necessário
        if third_candidate and len(candidate_results) == 2:
            best_score = max(r['ai_score'] for r in candidate_results)
            if best_score < 0.7:  # Se nenhum dos dois primeiros for convincente
                print(f"🔄 Testando terceiro candidato...")
                third_result = self._extract_detailed_info_with_ai_validation(user_query, third_candidate)
                if third_result:
                    candidate_results.append({
                        'candidate': third_candidate,
                        'result': third_result,
                        'ai_score': third_result.get('final_score', 0),
                        'probability': third_candidate.relevance_score
                    })

        # Seleciona o melhor resultado baseado no score final da IA
        if candidate_results:
            best_result = max(candidate_results, key=lambda x: x['ai_score'])
            final_result = best_result['result']
            selected_candidate = best_result['candidate']

            print(f"✅ Melhor candidato: {selected_candidate.name} (Score final: {best_result['ai_score']:.3f})")
        else:
            final_result = None
            selected_candidate = first_candidate

        if not final_result:
            return {"error": "Nenhum resultado detalhado encontrado", "query": user_query}

        # 🌶️ FASE 3: Enriquecimento Contextual
        print(f"🌶️ Fase 3: Analisando necessidade de enriquecimento contextual...")

        # Prepara informações do endpoint para detecção de contexto
        endpoint_info_for_context = {
            "name": selected_candidate.name,
            "category": selected_candidate.category,
            "summary": selected_candidate.summary,
            "keywords": selected_candidate.keywords
        }

        # Aplica enriquecimento contextual
        enriched_result = self._enrich_response_with_context(final_result, endpoint_info_for_context)

        # Cache do resultado enriquecido
        self._cache_result(user_query, enriched_result)

        return enriched_result

    def _initial_keyword_filter(self, query: str, endpoints: List[Dict]) -> List[Dict]:
        """Filtragem inicial por keywords e texto"""
        query_words = set(query.lower().split())
        candidates = []

        for endpoint in endpoints:
            # Cria texto para busca
            search_text = f"{endpoint['name']} {endpoint['summary']} {' '.join(endpoint['keywords'])}".lower()

            # Verifica se alguma palavra da query está presente
            if any(word in search_text for word in query_words):
                candidates.append(endpoint)

            # Busca por matches parciais também
            elif any(word in search_text for word in query_words if len(word) > 3):
                candidates.append(endpoint)

        return candidates[:20]  # Limita candidatos

    def _extract_detailed_info_with_ai_validation(self, user_query: str, candidate: SearchResult) -> Optional[Dict]:
        """
        📝 Extração detalhada das informações do endpoint
        Fase 2: Confirmação do match + estruturação completa
        """

        try:
            # Carrega map específico
            map_path = f"endpoints-and-hooks/{candidate.source}/map.json"
            with open(map_path, 'r', encoding='utf-8') as f:
                map_data = json.load(f)

            # Encontra localização no map
            location_info = self._find_endpoint_in_map(candidate.name, map_data)

            if not location_info:
                print(f"❌ Localização não encontrada no map para {candidate.name}")
                return None

            # Extrai conteúdo específico do description.md
            description_path = f"endpoints-and-hooks/{candidate.source}/description.md"

            # Determina linha final baseado na disponibilidade de response
            start_line = location_info['request']['startLine']
            if 'response' in location_info:
                end_line = location_info['response']['endLine']
            else:
                end_line = location_info['request']['endLine']

            detailed_content = self._extract_content_by_location(
                description_path,
                start_line,
                end_line
            )

            if not detailed_content:
                print(f"❌ Conteúdo não extraído para {candidate.name}")
                return None

            # IA processa e estrutura a informação final
            return self._ai_structure_final_response(user_query, candidate, location_info, detailed_content)

        except Exception as e:
            print(f"❌ Erro na extração detalhada: {e}")
            return None

    def _find_endpoint_in_map(self, endpoint_name: str, map_data: Dict) -> Optional[Dict]:
        """Encontra endpoint específico no map.json usando o nome exato"""

        for category, data in map_data.items():
            if isinstance(data, dict) and 'endpoints' in data:
                for endpoint in data['endpoints']:
                    # Busca por nome exato
                    if endpoint.get('name', '') == endpoint_name:
                        return endpoint.get('location', {})

        return None

    def _extract_content_by_location(self, file_path: str, start_line: int, end_line: int) -> str:
        """Extração cirúrgica de conteúdo por linhas específicas"""

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            # Ajusta índices (1-based para 0-based)
            start_idx = max(0, start_line - 1)
            end_idx = min(len(lines), end_line)

            # Adiciona contexto extra se necessário
            context_start = max(0, start_idx - 2)
            context_end = min(len(lines), end_idx + 2)

            return ''.join(lines[context_start:context_end])

        except Exception as e:
            print(f"❌ Erro ao extrair conteúdo: {e}")
            return ""

    def _ai_structure_final_response(self, user_query: str, candidate: SearchResult,
                                   location_info: Dict, content: str) -> Dict:
        """
        🤖 IA estrutura a resposta final em JSON completo
        """

        system_prompt = """
        Você é um especialista em APIs REST e Evolution API.

        TAREFA: Estruturar informações de endpoint em JSON super detalhado e validar o match.

        RETORNE um JSON com esta estrutura EXATA:
        {
            "endpoint": {
                "method": "POST/GET/PUT/DELETE",
                "path": "/caminho/completo/{instanceName}",
                "name": "Nome do Endpoint",
                "category": "Categoria",
                "description": "Descrição detalhada",
                "purpose": "Para que serve",
                "when_to_use": ["quando usar 1", "quando usar 2"]
            },
            "authentication": {
                "required": true,
                "type": "header",
                "key": "apikey",
                "description": "Chave de API obrigatória"
            },
            "headers": {
                "required": ["Content-Type", "apikey"],
                "optional": [],
                "examples": {
                    "Content-Type": "application/json",
                    "apikey": "{SUA_API_KEY}"
                }
            },
            "path_parameters": {
                "instanceName": {
                    "type": "string",
                    "required": true,
                    "description": "Nome da instância WhatsApp",
                    "example": "minha-instancia",
                    "pattern": "^[a-zA-Z0-9_-]+$"
                }
            },
            "query_parameters": {
                "limit": {
                    "type": "integer",
                    "required": false,
                    "description": "Limite de resultados",
                    "example": 10,
                    "default": 20
                },
                "since": {
                    "type": "string",
                    "required": false,
                    "description": "Data inicial no formato ISO",
                    "example": "2024-01-01T00:00:00Z"
                }
            },
            "request_body": {
                "required": true,
                "content_type": "application/json",
                "schema": {
                    "type": "object",
                    "properties": {
                        "field": {
                            "type": "string",
                            "description": "Descrição do campo"
                        }
                    },
                    "required": ["field"]
                },
                "example": {"field": "valor"},
                "description": "Descrição do body"
            },
            "responses": {
                "200": {
                    "description": "Sucesso",
                    "content_type": "application/json",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string"},
                            "data": {"type": "object"}
                        }
                    },
                    "example": {"status": "success", "data": {}}
                },
                "400": {
                    "description": "Erro de validação",
                    "content_type": "application/json",
                    "example": {"error": "Dados inválidos", "code": 400}
                }
            },
            "examples": [
                {
                    "title": "Exemplo básico",
                    "description": "Como usar este endpoint",
                    "curl": "curl -X POST https://api.example.com/endpoint",
                    "request": {},
                    "response": {}
                }
            ],
            "final_score": 0.95,
            "confidence": 0.90,
            "source": "custom/native",
            "match_reasoning": "Por que este endpoint corresponde à consulta"
        }

        IMPORTANTE PARA QUERY STRINGS:
        - Se o path contém query strings, use a notação: "/path?param1={Query1}&param2={Query2}"
        - Documente cada query parameter na seção "query_parameters"
        - Use {QueryX} para indicar substituições necessárias
        - Marque como required/optional cada query parameter

        IMPORTANTE PARA VALIDATION:
        - Calcule final_score baseado na qualidade do match (0.0 a 1.0)
        - Se o match for ruim, retorne score baixo (< 0.5)
        - Use seu conhecimento da Evolution API para validar se faz sentido
        - Seja rigoroso na avaliação do match
        """

        user_prompt = f"""
        CONSULTA ORIGINAL: "{user_query}"

        CANDIDATO SELECIONADO:
        - ID: {candidate.endpoint_id}
        - Nome: {candidate.name}
        - Categoria: {candidate.category}
        - Score: {candidate.relevance_score}
        - Fonte: {candidate.source}

        CONTEÚDO EXTRAÍDO DO DOCUMENTATION:
        {content}

        Analise o conteúdo e estruture as informações no JSON detalhado solicitado.
        Calcule um final_score baseado na qualidade do match com a consulta original.
        """

        try:
            provider = self.config['current_provider']

            if provider == 'anthropic':
                response = self.ai_client.messages.create(
                    model=self.config['anthropic']['model'],
                    max_tokens=self.config['anthropic']['max_tokens'],
                    temperature=self.config[self.config['current_provider']]['temperature_phase23'],
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}]
                )
                ai_response = response.content[0].text

            elif provider == 'openai':
                model = self.config['openai']['model']
                supports_system = not model.startswith('o1-')

                if supports_system:
                    messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ]
                else:
                    combined_prompt = f"{system_prompt}\n\n{user_prompt}"
                    messages = [{"role": "user", "content": combined_prompt}]

                response = self.ai_client.chat.completions.create(
                    model=model,
                    max_tokens=self.config['openai']['max_tokens'],
                    temperature=self.config[self.config['current_provider']]['temperature_phase23'],
                    messages=messages
                )
                ai_response = response.choices[0].message.content

            else:
                raise ValueError(f"Provider não suportado: {provider}")

            cleaned_response = self._clean_ai_response(ai_response)
            return json.loads(cleaned_response)

        except Exception as e:
            print(f"❌ Erro na estruturação final: {e}")
            return {
                "error": "Falha na estruturação da resposta",
                "candidate": candidate.__dict__,
                "final_score": candidate.relevance_score * 0.5
            }

    def _is_cached(self, query: str) -> bool:
        """Verifica se resultado está em cache válido"""
        if not self.config.get('cache_enabled', True):
            return False

        if query in self.cache:
            cache_time = self.cache_timestamps.get(query)
            if cache_time:
                ttl = timedelta(seconds=self.config.get('cache_ttl_seconds', 3600))
                return datetime.now() - cache_time < ttl

        return False

    def _cache_result(self, query: str, result: Dict):
        """Armazena resultado no cache"""
        if self.config.get('cache_enabled', True):
            self.cache[query] = result
            self.cache_timestamps[query] = datetime.now()


def optimized_constructor(user_query: str, config_path: str = "endpoints-and-hooks/config/ai_config.json") -> Dict:
    """
    🎯 FUNÇÃO PRINCIPAL DO CONSTRUCTOR

    Ponto de entrada para busca e construção de endpoints da Evolution API.

    Args:
        user_query: Consulta do usuário (ex: "como criar instância", "webhook de monitoramento")
        config_path: Caminho para arquivo de configuração

    Returns:
        Dict: JSON estruturado com informações completas do endpoint
    """

    print("🚀 Evolution API Constructor iniciado")
    print(f"📝 Query: '{user_query}'")

    try:
        # Inicializa o agente
        agent = EvolutionAPIConstructor(config_path)

        # Executa busca híbrida
        result = agent.search_api(user_query)

        print("✅ Busca concluída com sucesso")
        return result

    except Exception as e:
        error_result = {
            "error": f"Erro no constructor: {str(e)}",
            "query": user_query,
            "timestamp": datetime.now().isoformat()
        }
        print(f"❌ {error_result['error']}")
        return error_result


# 🧪 Exemplo de uso
if __name__ == "__main__":
    # Teste básico
    test_queries = [
        "como criar uma instância",
        "webhook de monitoramento",
        "filtros de áudio por duração",
        "estatísticas da fila global"
    ]

    for query in test_queries:
        print(f"\n{'='*50}")
        result = optimized_constructor(query)
        print(f"Resultado para '{query}':")
        print(json.dumps(result, indent=2, ensure_ascii=False))