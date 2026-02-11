# 💡 Exemplos de Uso - Pokédex AI

## 🎮 Exemplos de Perguntas para o Chatbot

### Informações Básicas

```
"Me fale sobre Pikachu"
"Quais são as evoluções do Eevee?"
"Mostre informações sobre Charizard"
"O que é um Pokémon do tipo Dragão?"
```

### Análise de Times

```
"Monte um time balanceado para iniciantes"
"Sugira um time mono-type de Água"
"Crie um time para derrotar o Campeão da Liga"
"Analise este time: Pikachu, Charizard, Blastoise, Venusaur, Dragonite, Mewtwo"
"Monte um time de Pokémon da 1ª geração"
```

### Estratégia e Batalhas

```
"Quais são os melhores counters para Mewtwo?"
"Como derrotar um time de Pokémon do tipo Psíquico?"
"Qual a melhor moveset para Garchomp?"
"Pikachu vs Raichu: qual é melhor?"
"Explique a tabela de tipos (força e fraqueza)"
```

### Comparações

```
"Compare Charizard e Blastoise"
"Qual é melhor: Gengar ou Alakazam?"
"Diferença entre Pokémon lendários e míticos"
"Mega Evoluções vs Gigantamax"
```

### Perguntas Avançadas

```
"Qual a melhor distribuição de EVs para um Pokémon sweeper?"
"Explique o sistema de IVs e EVs"
"Quais habilidades ocultas são mais úteis?"
"Estratégias de weather teams (time de clima)"
"Como funciona o breeding competitivo?"
```

## 🔌 Exemplos de Requisições API

### Autenticação

#### Registrar Novo Usuário

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ash_ketchum",
    "email": "ash@pokemon.com",
    "password": "pikachu123"
  }'
```

Resposta:

```json
{
  "id": 1,
  "username": "ash_ketchum",
  "email": "ash@pokemon.com",
  "is_active": true,
  "created_at": "2026-02-11T10:00:00Z"
}
```

#### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ash_ketchum",
    "password": "pikachu123"
  }'
```

Resposta:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Obter Usuário Atual

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Chat

#### Enviar Mensagem

```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Me fale sobre Pikachu"
  }'
```

Resposta:

```json
{
  "message": "Pikachu é um Pokémon do tipo Elétrico, número #025 na Pokédex Nacional. É a evolução de Pichu e pode evoluir para Raichu quando exposto a uma Pedra do Trovão...",
  "pokemon_data": {
    "id": 25,
    "name": "pikachu",
    "types": ["electric"],
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    "stats": {
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "special-attack": 50,
      "special-defense": 50,
      "speed": 90
    }
  },
  "suggestions": [
    "Qual é a melhor moveset para Pikachu?",
    "Quais Pokémon são counters de Pikachu?",
    "Como Pikachu evolui?"
  ]
}
```

#### Obter Histórico

```bash
curl -X GET http://localhost:8000/api/chat/history?limit=20 \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Limpar Histórico

```bash
curl -X DELETE http://localhost:8000/api/chat/history \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Pokémon

#### Buscar Pokémon Específico

```bash
# Por nome
curl -X GET http://localhost:8000/api/pokemon/pikachu \
  -H "Authorization: Bearer SEU_TOKEN"

# Por ID
curl -X GET http://localhost:8000/api/pokemon/25 \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Listar Pokémon (Paginado)

```bash
curl -X GET "http://localhost:8000/api/pokemon/?limit=20&offset=0" \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Buscar por Tipo

```bash
curl -X GET http://localhost:8000/api/pokemon/type/fire \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Buscar Pokémon (Query)

```bash
curl -X GET http://localhost:8000/api/pokemon/search/char \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Cadeia de Evolução

```bash
curl -X GET http://localhost:8000/api/pokemon/evolution/25 \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 🐍 Exemplos Python

### Usando a API com Python

```python
import requests

BASE_URL = "http://localhost:8000/api"

# 1. Login
def login(username, password):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": username, "password": password}
    )
    return response.json()["access_token"]

# 2. Enviar mensagem ao chat
def send_message(token, message):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/chat/message",
        headers=headers,
        json={"content": message}
    )
    return response.json()

# 3. Buscar Pokémon
def get_pokemon(token, identifier):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/pokemon/{identifier}",
        headers=headers
    )
    return response.json()

# Uso
token = login("ash_ketchum", "pikachu123")
response = send_message(token, "Me fale sobre Charizard")
print(response["message"])

pokemon = get_pokemon(token, "charizard")
print(f"Nome: {pokemon['name']}")
print(f"Tipos: {', '.join([t['type']['name'] for t in pokemon['types']])}")
```

## 🎯 Casos de Uso Práticos

### 1. Construtor de Times Competitivos

```python
# Pedir sugestão de time
message = "Monte um time competitivo focado em sweepers rápidos com cobertura de tipos balanceada"

# O chatbot irá sugerir algo como:
# - Greninja (Água/Dark)
# - Talonflame (Fogo/Voador)
# - Garchomp (Dragão/Terra)
# - Aegislash (Aço/Fantasma)
# - Rotom-W (Elétrico/Água)
# - Tapu Koko (Elétrico/Fada)
```

### 2. Análise de Fraquezas de Time

```python
message = "Analise as fraquezas deste time: Charizard, Venusaur, Blastoise, Pikachu, Gengar, Dragonite"

# O chatbot irá identificar:
# - Fraqueza dupla a Pokémon do tipo Pedra
# - Vulnerabilidade a Pokémon Elétricos rápidos
# - Sugestões de substituições
```

### 3. Guia de Evoluções

```python
message = "Explique todas as formas de evolução do Eevee e quando cada uma é mais útil"

# O chatbot explicará as 8 evoluções (Eeveelutions) e suas utilidades
```

### 4. Comparação Detalhada

```python
message = "Compare Mewtwo e Mew em termos de stats, movepool e utilidade competitiva"

# Análise comparativa detalhada
```

## 📊 Fluxos de Trabalho Comuns

### Novo Jogador

1. "Quais são os melhores Pokémon iniciais?"
2. "Como funciona o sistema de tipos?"
3. "Monte um time balanceado para iniciantes"
4. "Explique EVs e IVs de forma simples"

### Jogador Intermediário

1. "Sugira um time mono-type competitivo"
2. "Quais são as melhores estratégias de batalha?"
3. "Como montar um rain team?"
4. "Análise de matchups: meu time vs time de Dragão"

### Jogador Avançado

1. "Teoria de times para VGC 2026"
2. "Análise de meta: top threats atuais"
3. "Otimização de EV spread para Landorus-T"
4. "Counters específicos para Zacian-Crowned"

## 🎨 Integrações Personalizadas

### Bot do Discord

```python
import discord
from discord.ext import commands
import requests

bot = commands.Bot(command_prefix='!')

@bot.command()
async def pokedex(ctx, *, query):
    """Consulta a Pokédex AI"""
    token = get_token()  # Sua função de auth
    response = send_message(token, query)
    await ctx.send(response["message"])

bot.run('TOKEN_DO_DISCORD')
```

### Telegram Bot

```python
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler

async def pokemon(update: Update, context):
    query = ' '.join(context.args)
    token = get_token()
    response = send_message(token, query)
    await update.message.reply_text(response["message"])

app = ApplicationBuilder().token("TOKEN_DO_TELEGRAM").build()
app.add_handler(CommandHandler("pokemon", pokemon))
app.run_polling()
```

## 🔧 Dicas e Truques

### Otimização de Respostas

- Seja específico: "Monte um rain team competitivo para VGC" é melhor que "sugira um time"
- Contextualize: Mencione o formato de batalha (Single, Double, VGC)
- Iterativo: Faça perguntas de follow-up para refinar sugestões

### Performance

- Cache respostas comuns localmente
- Use batch requests quando possível
- Implemente debouncing no frontend

### Segurança

- Nunca exponha tokens no código
- Use variáveis de ambiente
- Implemente rate limiting
- Valide inputs do usuário

---

Explore esses exemplos e crie suas próprias experiências únicas com a Pokédex AI! 🔴✨
