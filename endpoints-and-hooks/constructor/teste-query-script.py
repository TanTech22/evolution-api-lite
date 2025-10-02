#!/usr/bin/env python3
"""
🧪 Script de Teste Automatizado do Constructor
Executa 120 prompts e preenche o arquivo de respostas incrementalmente
"""

import sys
import os
import time
import re
import json
from datetime import datetime, timedelta
from pathlib import Path

# Adiciona o diretório atual ao path para imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from constructor_optimized_fixed import optimized_constructor
    constructor_function = optimized_constructor
    print("✅ Usando constructor otimizado (fixed) - VERSÃO PRODUÇÃO")
except ImportError:
    try:
        from constructor import constructor
        constructor_function = constructor
        print("✅ Usando constructor básico (fallback)")
    except ImportError:
        print("❌ Erro: Não foi possível importar nenhuma função constructor")
        sys.exit(1)

class RateLimiter:
    """Controla rate limiting para API"""

    def __init__(self, requests_per_minute=50):
        self.requests_per_minute = requests_per_minute
        self.requests = []
        self.enabled = True

    def wait_if_needed(self):
        """Espera se necessário para respeitar rate limit"""
        if not self.enabled:
            return

        now = datetime.now()
        # Remove requests mais antigos que 1 minuto
        self.requests = [req_time for req_time in self.requests if now - req_time < timedelta(minutes=1)]

        if len(self.requests) >= self.requests_per_minute:
            # Calcula quanto tempo esperar
            oldest_request = min(self.requests)
            wait_until = oldest_request + timedelta(minutes=1)
            wait_seconds = (wait_until - now).total_seconds()

            if wait_seconds > 0:
                print(f"⏳ Rate limit: aguardando {wait_seconds:.1f}s...")
                time.sleep(wait_seconds)

    def record_request(self):
        """Registra uma nova request"""
        if self.enabled:
            self.requests.append(datetime.now())

class ConstructorTester:
    """Classe para automatizar testes do constructor"""

    def __init__(self):
        self.prompts_file = "teste-query-prompts.md"
        self.response_file = "teste-queries-response.md"
        self.prompts = []
        self.current_test = 0
        self.rate_limiter = RateLimiter(50)  # 50 RPM para Anthropic
        self.results_summary = {
            "total": 0,
            "success": 0,
            "errors": 0,
            "total_time": 0,
            "avg_time": 0,
            "enhancement_count": 0
        }
        self.load_rate_config()

    def load_rate_config(self):
        """Carrega configuração de rate limiting"""
        try:
            config_path = "/root/evolution-api-lite/endpoints-and-hooks/config/ai_config.json"
            with open(config_path, 'r') as f:
                config = json.load(f)

            rate_config = config.get("rate_limiting", {})
            if rate_config.get("enabled", True):
                rpm = rate_config.get("requests_per_minute", 50)
                self.rate_limiter = RateLimiter(rpm)
                print(f"📊 Rate limiting: {rpm} requests/minute")
            else:
                self.rate_limiter.enabled = False
                print("📊 Rate limiting: desabilitado")

        except Exception as e:
            print(f"⚠️ Erro ao carregar config de rate limiting: {e}")

    def extract_prompts_from_md(self) -> list:
        """Extrai prompts do arquivo markdown"""
        prompts = []

        if not os.path.exists(self.prompts_file):
            print(f"❌ Arquivo {self.prompts_file} não encontrado")
            return prompts

        with open(self.prompts_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Regex para extrair prompts numerados (ex: 1. "como criar uma instância")
        pattern = r'^\d+\.\s*"([^"]+)"'
        matches = re.findall(pattern, content, re.MULTILINE)

        # Também busca prompts sem aspas (ex: 91. asdfghjkl)
        pattern2 = r'^\d+\.\s*([^"\n]+)$'
        matches2 = re.findall(pattern2, content, re.MULTILINE)

        # Combina e limpa duplicatas
        all_prompts = matches + [m.strip() for m in matches2 if m.strip() not in matches]

        # Remove prompts vazios ou muito curtos
        prompts = [p.strip() for p in all_prompts if len(p.strip()) > 0]

        print(f"📋 Extraídos {len(prompts)} prompts do arquivo")
        return prompts

    def reset_response_file(self):
        """Zera o arquivo de respostas e cria cabeçalho"""
        header = """# 🧪 Respostas dos Testes do Constructor

## 📋 Objetivo

Este documento acumula as respostas dos testes do Evolution API Constructor, organizadas por prompt com suas respectivas métricas e resultados.

**Início dos Testes:** {timestamp}

---

""".format(timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        with open(self.response_file, 'w', encoding='utf-8') as f:
            f.write(header)

        print(f"✅ Arquivo {self.response_file} resetado")

    def run_single_test(self, prompt: str) -> dict:
        """Executa um teste individual com rate limiting"""
        print(f"\n🧪 Testando: '{prompt}'")

        # Rate limiting
        self.rate_limiter.wait_if_needed()

        start_time = time.time()

        try:
            # Muda para o diretório raiz para execução
            original_dir = os.getcwd()
            os.chdir("/root/evolution-api-lite")

            # Registra request para rate limiting
            self.rate_limiter.record_request()

            # Executa o constructor
            result = constructor_function(prompt)

            # Volta para o diretório original
            os.chdir(original_dir)
            execution_time = time.time() - start_time

            # Analisa o resultado
            success = "error" not in result and result.get("final_score", 0) > 0
            has_enhancement = "enhanced_documentation" in result
            final_score = result.get("final_score", 0)

            # Extrai a resposta principal
            response_text = ""
            if success:
                if "markdown_documentation" in result:
                    response_text = result["markdown_documentation"][:500] + "..." if len(result.get("markdown_documentation", "")) > 500 else result.get("markdown_documentation", "")
                elif "response" in result:
                    response_text = str(result["response"])[:500] + "..." if len(str(result.get("response", ""))) > 500 else str(result.get("response", ""))
                else:
                    response_text = str(result)[:500] + "..."

            return {
                "success": success,
                "execution_time": execution_time,
                "has_enhancement": has_enhancement,
                "final_score": final_score,
                "response_text": response_text,
                "full_result": result,
                "error": None
            }

        except Exception as e:
            execution_time = time.time() - start_time
            print(f"❌ Erro: {str(e)}")

            return {
                "success": False,
                "execution_time": execution_time,
                "has_enhancement": False,
                "final_score": 0,
                "response_text": "",
                "full_result": {},
                "error": str(e)
            }

    def append_result_to_file(self, prompt: str, test_number: int, result: dict):
        """Adiciona resultado ao arquivo incrementalmente"""

        # Prepara template do resultado
        template = f"""## {test_number}. Prompt: "{prompt}"

**Métricas:**
- Tempo de resposta: {result['execution_time']:.2f}s
- Context enhancement: {'Sim' if result['has_enhancement'] else 'Não'}
- Final score: {result['final_score']:.2f}

**Resposta:**
"""

        # Adiciona resposta ou erro
        if result['success']:
            template += f"{result['response_text']}\n"
        else:
            template += "ERRO"
            if result['error']:
                template += f" - {result['error']}"
            template += "\n"

        template += "\n---\n\n"

        # Append ao arquivo
        with open(self.response_file, 'a', encoding='utf-8') as f:
            f.write(template)

        # Atualiza estatísticas
        self.results_summary["total"] += 1
        if result['success']:
            self.results_summary["success"] += 1
        else:
            self.results_summary["errors"] += 1

        self.results_summary["total_time"] += result['execution_time']
        self.results_summary["avg_time"] = self.results_summary["total_time"] / self.results_summary["total"]

        if result['has_enhancement']:
            self.results_summary["enhancement_count"] += 1

        # Progress
        progress = (self.results_summary["total"] / len(self.prompts)) * 100 if self.prompts else 0
        success_rate = (self.results_summary["success"] / self.results_summary["total"]) * 100

        print(f"✅ Resultado #{test_number} salvo")
        print(f"📊 Progress: {progress:.1f}% | Success: {success_rate:.1f}% | Avg Time: {self.results_summary['avg_time']:.2f}s")

    def append_final_summary(self):
        """Adiciona resumo final ao arquivo"""

        enhancement_rate = (self.results_summary["enhancement_count"] / self.results_summary["total"]) * 100 if self.results_summary["total"] > 0 else 0
        success_rate = (self.results_summary["success"] / self.results_summary["total"]) * 100 if self.results_summary["total"] > 0 else 0

        summary = f"""## 📊 Resumo Final dos Resultados

**Data/Hora de Conclusão:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

**Total de Prompts Testados:** {self.results_summary["total"]}/120

**Distribuição de Resultados:**
- ✅ Sucessos: {self.results_summary["success"]} ({success_rate:.1f}%)
- ❌ Erros: {self.results_summary["errors"]} ({100-success_rate:.1f}%)

**Métricas Gerais:**
- Tempo total de execução: {self.results_summary["total_time"]:.2f}s
- Tempo médio de resposta: {self.results_summary["avg_time"]:.2f}s
- Taxa de context enhancement: {enhancement_rate:.1f}%

**Status do Teste:** ✅ Concluído com sucesso
"""

        with open(self.response_file, 'a', encoding='utf-8') as f:
            f.write(summary)

        print(f"\n🎉 Resumo final adicionado ao arquivo {self.response_file}")

    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando execução dos testes automatizados")
        print("=" * 60)

        # Carrega prompts
        self.prompts = self.extract_prompts_from_md()
        if not self.prompts:
            print("❌ Nenhum prompt encontrado. Verifique o arquivo teste-query-prompts.md")
            return

        # Reset do arquivo
        self.reset_response_file()

        # Executa testes
        for i, prompt in enumerate(self.prompts, 1):
            try:
                result = self.run_single_test(prompt)
                self.append_result_to_file(prompt, i, result)

                # Pausa pequena entre testes para evitar sobrecarga
                time.sleep(0.5)

            except KeyboardInterrupt:
                print(f"\n⏸️ Testes interrompidos pelo usuário no prompt #{i}")
                print(f"📊 Progresso: {i-1} de {len(self.prompts)} testes concluídos")
                break
            except Exception as e:
                print(f"❌ Erro inesperado no prompt #{i}: {e}")
                continue

        # Adiciona resumo final
        self.append_final_summary()

        print("\n" + "=" * 60)
        print("✅ Execução dos testes concluída!")
        print(f"📄 Resultados salvos em: {self.response_file}")
        print(f"📊 Taxa de sucesso: {(self.results_summary['success']/self.results_summary['total'])*100:.1f}%")

def main():
    """Função principal"""
    print("🧪 Evolution API Constructor - Script de Teste Automatizado")
    print("=" * 60)

    # Muda para o diretório correto se necessário
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    # Verifica se estamos no diretório correto
    if not os.path.exists("teste-query-prompts.md"):
        print("❌ Arquivo teste-query-prompts.md não encontrado")
        print("Certifique-se de executar o script no diretório endpoints-and-hooks/constructor/")
        return

    # Pergunta confirmação
    response = input("🤔 Deseja executar todos os 120 testes? (s/N): ").lower().strip()
    if response not in ['s', 'sim', 'y', 'yes']:
        print("❌ Execução cancelada pelo usuário")
        return

    # Executa testes
    tester = ConstructorTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()