# Como adicionar uma nova confissão

As confissões/símbolos reformados aparecem em **Vida espiritual → Confissões**. Cada uma é um arquivo em [`src/data/confissoes/`](../src/data/confissoes/) e existe em dois tipos.

---

## Tipo `"leitura"` — PDF com texto → JSON estruturado

Para PDFs que **têm camada de texto** (Catecismo de Heidelberg, Cânones de Dort), gere o JSON com o parser:

```bash
node scripts/pdf-to-confissao-json.ts "<caminho.pdf>" \
  --formato <heidelberg|dort> \
  --id <id-sem-acentos> \
  --titulo "Título" --subtitulo "..." --autor "..." --ano "..." --descricao "..."
```

- `--formato heidelberg` → estrutura `Dia do Senhor N`, `P.`/`R.`, `Parte I–III`.
- `--formato dort` → estrutura de Capítulos, `Artigo N`, `Rejeição de Erros`, `Conclusão`, `Glossário`.
- `--formato belga` → estrutura `ARTIGO N` + título em caixa alta, corpo e notas de rodapé.
- `--formato guanabara` → artigos em algarismos romanos (`I.`–`XVII.`), com Introdução e Preâmbulo.
- `--formato westminster` → perguntas numeradas (`N. …?`) + resposta + linha de referências bíblicas (Catecismo Maior).
- `--formato westminster-breve` → `PERGUNTA N.` / `R.`/`RESPOSTA.` / `Ref.`/`Referências:` + apêndices (Catecismo Menor).
- `--formato westminster-cf` → `CAPÍTULO N: título` + seções numeradas (`1.`, `2.`…) (Confissão de Fé; pula o índice inicial).
- `--formato teses` → introdução + `Nª Tese` seguido do texto (As 95 Teses; renumera as teses pela posição).
- `--formato solas` → seções `SOLA XXX: título` + corpo + `Tese N:` (As Cinco Solas / Declaração de Cambridge).
- `--formato calvinismo` → artigo com seções `N. Título` (Os Cinco Pontos do Calvinismo; ignora as notas de rodapé).
- `--formato credo` → subtítulos em caixa alta (`ORIGEM`, `TEXTO`) como seções (Credos históricos; ignora as notas).

> Para gravar em outra coleção (ex.: Teologia reformada) use `--out src/data/teologia/<id>.json`.

O script é heurístico (como `scripts/pdf-to-study-json.ts`, que é específico do Catecismo Nova Cidade): **sempre revise o JSON gerado**. Para outros formatos de confissão, adicione um novo `parseXxx()` ao script.

### PDF digitalizado → leitura (colando o texto)

Se o PDF é uma imagem escaneada (sem texto), mas você tem o texto (ex.: copiado de outra fonte), salve-o num `.txt` e rode o parser com esse arquivo — a entrada `.txt` é lida direto, sem extração de PDF. Use `--arquivo-pdf` para manter o PDF original acessível como "Ver PDF original" na tela de leitura:

```bash
node scripts/pdf-to-confissao-json.ts caminho/texto.txt \
  --formato belga --id confissao-belga --titulo "Confissão Belga" \
  --arquivo-pdf confissao-belga.pdf   # arquivo em public/confissoes/
```

## Tipo `"pdf"` — só o visualizador

Quando não há texto disponível (só a imagem escaneada), a confissão é exibida apenas no visualizador. Passos:

1. Copie o PDF para [`public/confissoes/`](../public/confissoes/) com nome sem acentos (ex.: `confissao-belga.pdf`).
2. Crie o JSON manualmente:

```json
{
  "id": "confissao-belga",
  "titulo": "Confissão Belga",
  "subtitulo": "...",
  "autor": "...",
  "ano": "1561",
  "descricao": "...",
  "tipo": "pdf",
  "arquivoPdf": "confissao-belga.pdf",
  "secoes": []
}
```

> Os PDFs em `public/confissoes/` são **excluídos do pré-cache** do Service Worker (ver `next.config.ts`) e cacheados sob demanda (CacheFirst) ao serem abertos — ficam offline após a primeira visualização.

---

## Registrar no índice

Adicione o arquivo em [`src/data/confissoes/index.ts`](../src/data/confissoes/index.ts):

```ts
import minhaConfissao from "./minha-confissao.json";

export const confissoes = [
  // ...existentes
  minhaConfissao,
] as unknown as Confissao[];
```

Esse é o único ponto de registro — o serviço, a lista e as páginas SSG leem daí.

---

## Build

```bash
pnpm build
```

O build pré-renderiza `/vida-espiritual/confissoes/<id>` para cada confissão automaticamente.

## Teologia reformada

A seção **Vida espiritual → Teologia reformada** usa exatamente a mesma estrutura: documentos em [`src/data/teologia/`](../src/data/teologia/) (tipo `"pdf"` com o arquivo em `public/teologia/`, ou tipo `"leitura"` gerado pelo mesmo parser), registrados em `src/data/teologia/index.ts`, e as páginas em `(tabs)/vida-espiritual/teologia/`. Lista e leitura reaproveitam os componentes [`DocumentoLeituraList`](../src/components/DocumentoLeituraList.tsx) e [`DocumentoLeituraView`](../src/components/DocumentoLeituraView.tsx), compartilhados com as confissões. O precache offline é feito por `loadTeologiaRoutes()` em `next.config.ts`.

## Offline (PWA)

Funciona igual aos estudos: `loadConfissaoRoutes()` em [`next.config.ts`](../next.config.ts) lê `src/data/confissoes/*.json` e adiciona a lista e cada página de confissão ao **precache do Service Worker**. Toda confissão nova registrada no índice é pré-cacheada automaticamente no próximo build — o texto (tipo `"leitura"`) fica disponível offline sem precisar abrir antes. Só o PDF original das confissões tipo `"pdf"` (ou o link "Ver PDF original") depende de uma primeira abertura com internet, pois é cacheado sob demanda.
