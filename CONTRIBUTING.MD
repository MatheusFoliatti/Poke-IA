# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com a Pokédex AI! 🔴

## 📋 Código de Conduta

Este projeto adota o [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Ao participar, espera-se que você siga este código.

## 🚀 Como Contribuir

### Reportando Bugs

Antes de criar um issue para reportar um bug:

1. **Verifique** se o bug já foi reportado na [lista de issues](https://github.com/seu-usuario/pokedex-ai/issues)
2. **Inclua** informações detalhadas:
   - Versão do sistema operacional
   - Versão do Python e Node.js
   - Passos para reproduzir o bug
   - Comportamento esperado vs. comportamento atual
   - Screenshots (se aplicável)
   - Logs de erro

### Sugerindo Melhorias

Para sugerir novas funcionalidades:

1. **Verifique** se a sugestão já existe
2. **Descreva** claramente a funcionalidade
3. **Explique** por que ela seria útil
4. **Forneça** exemplos de uso

### Pull Requests

#### Preparação

1. **Fork** o repositório
2. **Clone** seu fork:

```bash
git clone https://github.com/seu-usuario/pokedex-ai.git
cd pokedex-ai
```

3. **Configure** o repositório upstream:

```bash
git remote add upstream https://github.com/original/pokedex-ai.git
```

4. **Crie** uma branch para sua feature:

```bash
git checkout -b feature/minha-feature
# ou
git checkout -b fix/meu-bugfix
```

#### Desenvolvimento

##### Backend (Python)

1. **Siga** o PEP 8 style guide
2. **Use** type hints quando possível
3. **Documente** funções e classes:

```python
def minha_funcao(param: str) -> dict:
    """
    Descrição curta da função.

    Args:
        param: Descrição do parâmetro

    Returns:
        Descrição do retorno
    """
    pass
```

4. **Teste** suas mudanças:

```bash
pytest tests/
```

##### Frontend (React/TypeScript)

1. **Use** TypeScript estritamente tipado
2. **Siga** convenções React:
   - Componentes funcionais com hooks
   - Props interfaces claramente definidas
   - Nomenclatura descritiva

3. **Mantenha** componentes pequenos e reutilizáveis

4. **Formato** código com Prettier:

```bash
npm run lint
```

#### Commits

Use commits semânticos:

```
feat: adiciona busca por região na Pokédex
fix: corrige erro ao carregar sprites
docs: atualiza README com instruções Docker
style: formata código do componente Login
refactor: melhora performance do chat
test: adiciona testes para authService
chore: atualiza dependências
```

Tipos de commit:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação de código
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Tarefas de build/ferramentas

#### Enviando o Pull Request

1. **Certifique-se** de que o código está funcionando
2. **Atualize** a documentação se necessário
3. **Execute** testes
4. **Commit** e **push**:

```bash
git add .
git commit -m "feat: adiciona funcionalidade X"
git push origin feature/minha-feature
```

5. **Abra** um Pull Request no GitHub
6. **Descreva** suas mudanças claramente
7. **Referencie** issues relacionadas (#123)

### Revisão de Código

- Seja respeitoso e construtivo
- Faça perguntas, não demandas
- Aceite feedback com boa vontade
- Aprenda com as revisões

## 🏗️ Estrutura do Projeto

```
pokedex-ai/
├── backend/          # API FastAPI
│   ├── app/
│   │   ├── api/     # Endpoints
│   │   ├── core/    # Config, segurança, LLM
│   │   ├── db/      # Modelos e database
│   │   ├── schemas/ # Schemas Pydantic
│   │   └── services/# Lógica de negócio
│   └── tests/       # Testes backend
│
└── frontend/         # App React
    ├── src/
    │   ├── components/ # Componentes React
    │   ├── hooks/      # Custom hooks
    │   ├── services/   # API clients
    │   ├── store/      # Zustand stores
    │   └── types/      # TypeScript types
    └── public/         # Assets estáticos
```

## 🧪 Testes

### Backend

```bash
cd backend
pytest tests/ -v
pytest tests/ --cov=app
```

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

## 📝 Documentação

- Atualize o README.md se adicionar funcionalidades
- Documente APIs no código (FastAPI gera docs automaticamente)
- Adicione comentários para lógica complexa
- Atualize QUICKSTART.md se mudar o setup

## 🎨 Design Guidelines

### UI/UX

- Mantenha consistência com o tema Pokémon
- Use as cores da paleta definida
- Priorize responsividade
- Foque em acessibilidade

### Performance

- Minimize chamadas à API
- Implemente cache quando apropriado
- Otimize imagens
- Use lazy loading

## 🐛 Debugging

### Backend

```bash
# Modo debug
uvicorn app.main:app --reload --log-level debug
```

### Frontend

- Use React DevTools
- Ative Source Maps
- Console.log estratégico

## 📊 Prioridades de Desenvolvimento

### Alta Prioridade

- 🔒 Segurança
- 🐛 Bugs críticos
- ⚡ Performance

### Média Prioridade

- ✨ Novas funcionalidades
- 🎨 Melhorias de UI/UX
- 📚 Documentação

### Baixa Prioridade

- 🧹 Refatoração
- 🎭 Estilo/formatação
- 💡 Ideias futuras

## 💬 Comunicação

- **Issues**: Para bugs e features
- **Discussions**: Para ideias e perguntas
- **Pull Requests**: Para contribuições de código

## 🎁 Reconhecimento

Contribuidores serão reconhecidos no README.md e release notes!

---

Obrigado por contribuir! Juntos vamos criar a melhor Pokédex com IA! 🔴✨
