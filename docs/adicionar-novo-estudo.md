# Como adicionar um novo estudo ao PWA

Este guia descreve o passo a passo completo para publicar um novo estudo de grupos de crescimento no aplicativo.

---

## Visão geral do fluxo

```
1. Editar studies.json  →  2. Prefetch das passagens bíblicas  →  3. Build  →  4. Deploy
```

---

## Passo 1 — Adicionar o estudo em `src/data/studies.json`

Abra o arquivo [`src/data/studies.json`](../src/data/studies.json) e adicione um novo objeto ao array raiz.

### Estrutura completa

```json
{
  "id": "nome-do-estudo",
  "title": "Título do Estudo",
  "subtitle": "Subtítulo ou descrição curta",
  "author": "Nome do Autor",
  "coverImage": null,
  "introduction": "Texto de introdução ao estudo...",
  "lessons": [
    {
      "id": "nome-do-estudo-01",
      "order": 1,
      "title": "Título da Lição",
      "bibleReference": "Livro capítulo:versículo-versículo",
      "content": [
        {
          "type": "paragraph",
          "text": "Parágrafo normal do conteúdo."
        },
        {
          "type": "numbered_point",
          "text": "Ponto numerado com referências bíblicas como (Rm 8:1).",
          "bold": true
        }
      ],
      "reflectionQuestions": [
        "Primeira pergunta de reflexão?",
        "Segunda pergunta de reflexão?"
      ]
    }
  ]
}
```

### Regras de nomenclatura de IDs

| Campo | Regra | Exemplo |
|---|---|---|
| `id` do estudo | minúsculas, hifens, sem acentos | `"filipenses"` |
| `id` da lição | `{idEstudo}-{ordem com dois dígitos}` | `"filipenses-01"` |

### Tipos de bloco de conteúdo (`content[].type`)

| Tipo | Uso |
|---|---|
| `paragraph` | Parágrafo normal |
| `heading` | Subtítulo dentro da lição |
| `numbered_point` | Ponto numerado (a numeração é automática na tela) |
| `sub_point` | Sub-ponto dentro de um ponto numerado |
| `bible_quote` | Citação bíblica em destaque |

### Propriedades opcionais dos blocos

| Propriedade | Tipo | Descrição |
|---|---|---|
| `bold` | `boolean` | Negrito |
| `italic` | `boolean` | Itálico |

### Referências bíblicas no texto

Referências no formato padrão são detectadas e viram links automáticos:

```
Rm 8:1       → Romanos 8:1
Jo 3:16-17   → João 3:16-17
Gl 5:1       → Gálatas 5:1
```

---

## Passo 2 — Prefetch das passagens bíblicas (para funcionamento offline)

As passagens bíblicas referenciadas nas lições precisam ser baixadas e salvas localmente para funcionar offline.

Execute:

```bash
pnpm prefetch-bible
```

O script lê `src/data/studies.json`, identifica todas as referências bíblicas, busca na API e salva em [`src/data/bible-passages.json`](../src/data/bible-passages.json).

**O script é incremental** — ele pula passagens que já estão salvas, portanto é seguro rodar novamente a qualquer momento.

---

## Passo 3 — Gerar o build de produção

```bash
pnpm build
```

O build:
- Pré-renderiza todas as páginas dos estudos (SSG)
- Gera o Service Worker com o precache atualizado
- Inclui automaticamente as novas rotas do estudo

---

## Passo 4 — Subir para produção (deploy)

Após o build, faça o deploy normalmente para o seu ambiente (Vercel, VPS, etc.).

Os usuários que já têm o PWA instalado receberão o novo Service Worker automaticamente na próxima vez que abrirem o app com internet. As novas páginas serão baixadas para o cache e estarão disponíveis offline.

---

## Exemplo completo — Filipenses

```json
{
  "id": "filipenses",
  "title": "Filipenses",
  "subtitle": "A Epístola da Alegria",
  "author": "Nome do Autor",
  "coverImage": null,
  "introduction": "Paulo escreve esta carta da prisão com um tom surpreendentemente alegre...",
  "lessons": [
    {
      "id": "filipenses-01",
      "order": 1,
      "title": "Alegria no Evangelho",
      "bibleReference": "Filipenses 1:1-11",
      "content": [
        {
          "type": "paragraph",
          "text": "Paulo inicia a carta cumprimentando os santos em Filipes..."
        },
        {
          "type": "numbered_point",
          "text": "A alegria de Paulo nasce da certeza do evangelho (v 3-6). Deus que começou a boa obra irá completá-la (Fp 1:6).",
          "bold": true
        }
      ],
      "reflectionQuestions": [
        "O que sustenta a alegria de Paulo mesmo na prisão?",
        "Como você encontra alegria nas circunstâncias difíceis?"
      ]
    }
  ]
}
```

---

## Resumo dos comandos

```bash
# 1. Edite src/data/studies.json

# 2. Baixe as passagens bíblicas offline
pnpm prefetch-bible

# 3. Gere o build
pnpm build

# 4. Teste localmente (opcional)
pnpm start
```
