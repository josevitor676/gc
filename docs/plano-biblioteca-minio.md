# Plano de Implementacao: Biblioteca com MinIO self-hosted

## Objetivo

Implementar uma Biblioteca publica de PDFs no site/PWA da igreja usando MinIO como object storage S3-compatible, preparando a base para integracoes mais avancadas, upload automatizado e maior proximidade com padroes de mercado baseados em buckets e objetos.

Essa abordagem faz mais sentido quando a equipe quer nascer em um modelo proximo de S3 desde o inicio.

## Quando essa opcao faz sentido

- Existe interesse real em arquitetura S3-compatible desde o MVP.
- A equipe pretende ter upload/admin automatizado em curto prazo.
- Existe familiaridade tecnica com buckets, CORS, policies e URLs assinadas.
- A equipe aceita maior complexidade operacional inicial.

## Observacao importante

Antes de seguir com essa opcao, e necessario revisar dois pontos:

- Implicacoes da licenca AGPLv3 para o uso pretendido.
- Risco operacional atual do ecossistema/projeto antes de adotar em producao.

## Arquitetura proposta

### Componentes

1. App Next.js/PWA
   - Lista materiais.
   - Filtra e pesquisa no catalogo.
   - Abre PDFs com viewer embutido.

2. Catalogo de metadados
   - Inicialmente mantido no repositorio ou na API interna.
   - Guarda referencia do objeto no bucket, URL final ou dados para geracao de URL.

3. MinIO em Docker
   - Armazena os PDFs como objetos em bucket.
   - Disponibiliza acesso publico ou controlado via URL assinada.

4. Volume persistente local
   - Armazena os dados do bucket no host.

5. Proxy reverso
   - TLS, roteamento e eventuais cabecalhos para acesso web.

## Modelos de acesso aos PDFs

### Opcao A: objetos publicos

O bucket ou prefixos de leitura sao publicos. O app recebe URLs estaveis.

Vantagens:

- Mais simples no MVP.
- Melhor para visualizacao embutida.
- Melhor para comportamento offline do PWA.

Desvantagens:

- Menos controle caso no futuro haja materiais restritos.

### Opcao B: URLs presigned

O bucket e privado e a API do app gera URLs temporarias para acesso.

Vantagens:

- Melhor base para restricao futura por login.
- Mais controle sobre exposicao de arquivos.

Desvantagens:

- Abertura e reabertura de PDFs fica mais delicada.
- Offline do PWA fica bem mais complexo.
- O frontend depende de renovacao da URL.

## Estrutura sugerida de objetos

```text
biblioteca-pdfs/
  gc/
  ebd/
  discipulado/
  lideranca/
  thumbs/
```

Exemplos de keys:

```text
gc/2026-gc-fundamentos-da-fe.pdf
ebd/2026-ebd-romanos-introducao.pdf
thumbs/gc-fundamentos-da-fe.jpg
```

## Metadados sugeridos para o catalogo

```json
[
  {
    "id": "gc-fundamentos-da-fe",
    "slug": "gc-fundamentos-da-fe",
    "titulo": "Fundamentos da Fe",
    "descricao": "Material introdutorio para grupos de crescimento.",
    "ministerio": "GC",
    "categoria": "Estudo",
    "tags": ["discipulado", "grupos"],
    "bucket": "biblioteca-pdfs",
    "objectKey": "gc/2026-gc-fundamentos-da-fe.pdf",
    "publicUrl": "https://storage.exemplo.org/biblioteca-pdfs/gc/2026-gc-fundamentos-da-fe.pdf",
    "thumbnailUrl": "https://storage.exemplo.org/biblioteca-pdfs/thumbs/gc-fundamentos-da-fe.jpg",
    "tamanhoMb": 3.4,
    "dataPublicacao": "2026-05-05"
  }
]
```

## Plano de implementacao por fases

### Fase 1: Infraestrutura base

1. Definir host com Docker Compose, dominio e HTTPS.
2. Subir MinIO com volume persistente local.
3. Criar bucket `biblioteca-pdfs`.
4. Definir credenciais fortes e acesso administrativo seguro.
5. Configurar politica de acesso do bucket.
6. Ajustar proxy reverso e, se necessario, cabecalhos CORS.

### Fase 2: Decisao de acesso publico ou presigned

1. Se a biblioteca for totalmente publica no MVP, preferir objetos publicos.
2. Se a equipe quiser preparar materiais privados no futuro, considerar presigned URLs.
3. Documentar claramente essa decisao porque ela impacta o frontend e o PWA.

### Fase 3: Integracao com o app

1. Criar ou manter catalogo proprio de metadados.
2. Criar API da biblioteca no app.
3. Se usar objetos publicos, a API devolve URL estavel.
4. Se usar presigned, a API devolve URL temporaria por detalhe.
5. Criar a aba Biblioteca no frontend.
6. Criar viewer embutido com tratamento de expiracao de URL, se aplicavel.

### Fase 4: PWA e offline

1. Cachear catalogo e thumbnails.
2. Se o bucket for publico, permitir cache seletivo de PDFs.
3. Se usar presigned, evitar depender apenas do cache do navegador.
4. Se offline for prioridade, considerar endpoint proprio do app para proxy/download.

### Fase 5: Evolucao administrativa

1. Criar painel admin para upload direto ao bucket.
2. Automatizar criacao de metadados.
3. Gerar thumbnails automaticamente.
4. Registrar auditoria de upload e publicacao.
5. Se necessario, introduzir autenticacao e materiais restritos por perfil.

## Pros

- Nasce em padrao S3-compatible.
- Integra melhor com SDKs e automacoes futuras.
- Bom caminho para upload direto do navegador.
- Facilita evolucao para painel admin mais sofisticado.
- Simplifica eventual migracao futura para outro provedor S3-compatible.

## Contras

- Complexidade maior para o tamanho atual do problema.
- Exige decisoes de bucket policy, CORS e modelo de acesso desde cedo.
- Presigned URLs pioram a experiencia offline e aumentam a complexidade do frontend.
- Para 5 GB e publicacao manual, tende a ser infraestrutura demais.
- Pode exigir mais conhecimento tecnico do time para operar com seguranca.

## Riscos operacionais

- Configuracao errada de bucket pode expor arquivos indevidamente.
- Presigned URLs podem expirar durante uso do viewer.
- CORS e cabecalhos HTTP podem quebrar embed de PDF em alguns navegadores.
- Backups mal planejados comprometem restauracao do bucket.

## Mitigacoes

- Para o MVP publico, preferir objetos publicos de leitura e API simples.
- Centralizar a decisao de URL na API do app, nao no frontend.
- Testar embed em navegadores moveis antes do go-live.
- Ter rotina documentada de backup e restore do volume.

## Impacto no projeto atual

Arquivos mais relevantes para a feature no repositorio:

- [src/app/(tabs)/layout.tsx](src/app/(tabs)/layout.tsx)
- [src/app/api/devocional-hoje/route.ts](src/app/api/devocional-hoje/route.ts)
- [src/app/api/pedidos-oracao/route.ts](src/app/api/pedidos-oracao/route.ts)
- [src/components/StudyCard.tsx](src/components/StudyCard.tsx)
- [src/services/studies.ts](src/services/studies.ts)
- [src/types/index.ts](src/types/index.ts)
- [next.config.ts](next.config.ts)
- [prisma/schema.prisma](prisma/schema.prisma)

## Recomendacoes tecnicas para o MVP

- Se a biblioteca for publica, prefira objetos publicos no comeco.
- Mantenha o catalogo no app desacoplado do bucket.
- Nao exponha detalhes de bucket e credenciais ao frontend.
- Se presigned URL for adotada, trate renovacao de forma centralizada na API.
- Teste offline cedo, porque esse e um ponto sensivel nessa arquitetura.

## Checklist de validacao

1. Criar bucket e enviar 3 PDFs.
2. Validar acesso por URL publica ou temporaria.
3. Validar embed do PDF em desktop e celular.
4. Testar expiracao e renovacao, se houver presigned URL.
5. Validar comportamento offline.
6. Testar backup e restore do volume.
7. Confirmar que a troca de estrategia de acesso nao exige reescrever o frontend.

## Decisao recomendada

Essa opcao so vale mais a pena se voces quiserem explicitamente uma base S3-compatible desde o inicio ou se o painel admin com upload automatizado for prioridade de curto prazo. Para o cenario atual da igreja, ela tende a ser mais complexa do que o necessario para o MVP.