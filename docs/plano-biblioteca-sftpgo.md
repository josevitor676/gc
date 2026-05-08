# Plano de Implementacao: Biblioteca com SFTPGo self-hosted em Docker + disco local/NAS

## Objetivo

Implementar uma Biblioteca publica de PDFs no site/PWA da igreja usando o SFTPGo como camada de armazenamento e entrega de arquivos, com baixo custo operacional, deploy simples e caminho claro para evolucao futura para painel administrativo.

Essa abordagem separa responsabilidades:

- O app continua dono do catalogo, filtros, UI e experiencia PWA.
- O SFTPGo fica responsavel por armazenar, organizar e disponibilizar os PDFs.

## Quando essa opcao faz sentido

- O acervo inicial e pequeno ou medio, por exemplo ate 5 GB.
- A publicacao inicial sera manual.
- A igreja nao quer depender de AWS, Azure ou storage pago.
- A equipe quer reduzir complexidade de infraestrutura no MVP.
- Existe possibilidade de usar um servidor local, VPS simples ou NAS como volume persistente.

## Arquitetura proposta

### Componentes

1. App Next.js/PWA
   - Lista materiais da biblioteca.
   - Busca e filtra por categoria, ministerio e titulo.
   - Abre o PDF em visualizacao embutida.

2. Catalogo de metadados
   - Inicialmente em arquivo versionado no repositorio.
   - Contem titulo, descricao, categoria, tags, URL do PDF, data, tamanho e slug.

3. SFTPGo em Docker
   - Armazena os PDFs em volume persistente.
   - Permite upload via WebAdmin, SFTP ou WebDAV.
   - Entrega arquivos por URL publica estavel ou compartilhamento controlado.

4. Disco local ou NAS
   - Volume persistente onde os PDFs ficam armazenados.
   - Pode ser local ao host Docker ou montado a partir de um NAS.

5. Proxy reverso
   - Nginx ou Caddy para TLS, roteamento e eventual cache.

## Fluxo funcional

1. Um responsavel sobe o PDF no SFTPGo.
2. O arquivo fica salvo em uma pasta padronizada por ministerio ou categoria.
3. O catalogo do app recebe a entrada do novo material com a URL publica do PDF.
4. O frontend lista o material na aba Biblioteca.
5. Ao clicar, o usuario abre o viewer embutido e pode baixar o arquivo se necessario.
6. O PWA pode manter cache do catalogo e cache seletivo dos PDFs mais recentes.

## Estrutura de diretorios sugerida no storage

```text
/biblioteca
  /gc
  /ebd
  /discipulado
  /lideranca
  /thumbs
```

Convencao de nome de arquivo:

```text
2026-gc-fundamentos-da-fe.pdf
2026-ebd-romanos-introducao.pdf
```

## Metadados sugeridos para o catalogo

Exemplo de estrutura para um futuro `biblioteca.json`:

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
    "url": "https://arquivos.exemplo.org/biblioteca/gc/2026-gc-fundamentos-da-fe.pdf",
    "thumbnailUrl": "https://arquivos.exemplo.org/biblioteca/thumbs/gc-fundamentos-da-fe.jpg",
    "tamanhoMb": 3.4,
    "dataPublicacao": "2026-05-05"
  }
]
```

## Plano de implementacao por fases

### Fase 1: Infraestrutura base

1. Escolher o host
   - VPS simples com Docker e disco persistente.
   - Ou servidor local 24/7.
   - Ou NAS montado no host Docker.

2. Configurar proxy reverso
   - Definir dominio ou subdominio, por exemplo `arquivos.igreja.org`.
   - Habilitar HTTPS.

3. Subir o SFTPGo em Docker Compose
   - Criar volumes para dados, configuracao e banco interno.
   - Expor apenas interfaces necessarias.
   - Desabilitar protocolos que nao serao usados.

4. Configurar usuarios e permissoes
   - Um usuario tecnico para publicacao.
   - Opcionalmente um usuario para conteudo ou secretaria.

5. Criar a estrutura de pastas
   - Pastas por ministerio e categoria.
   - Pasta separada para thumbnails, se necessario.

### Fase 2: Integracao com o app

1. Criar o catalogo de metadados no projeto.
2. Criar endpoints internos para listagem e detalhe.
3. Adicionar a aba Biblioteca na navegacao atual.
4. Criar tela de listagem com cards.
5. Criar tela de detalhe com visualizacao embutida do PDF.
6. Adicionar fallback de download para navegadores com suporte limitado.

### Fase 3: PWA e offline

1. Cachear catalogo e miniaturas.
2. Permitir cache sob demanda de PDFs ja acessados.
3. Limitar quantidade e tamanho total no cache do service worker.
4. Mostrar mensagem clara quando o PDF nao estiver disponivel offline.

### Fase 4: Evolucao administrativa

1. Manter upload manual no curto prazo via WebAdmin ou SFTP.
2. Depois, integrar o app com a API REST do SFTPGo para upload automatizado.
3. Migrar o catalogo de arquivo versionado para banco quando houver painel admin.
4. Adicionar auditoria simples de quem publicou e quando publicou.

## Pros

- Mais simples para operar em equipe pequena.
- Menor custo total para o MVP.
- Upload manual facil sem precisar construir admin de imediato.
- Desacoplamento bom entre arquivos e frontend.
- Funciona bem com disco local ou NAS existente.
- Backup simples usando snapshot, rsync ou copia de volume.
- Permite evolucao gradual sem redesenhar a UI do app.

## Contras

- Nao nasce em padrao S3-compatible.
- Upload direto do navegador no futuro sera menos natural do que em stack S3.
- Escala publica alta pode exigir mais configuracao de proxy e cache.
- Recursos avancados podem depender de fluxo manual por mais tempo.
- Um NAS domestico pode introduzir gargalos de disponibilidade e desempenho.

## Riscos operacionais

- Servidor local sem energia ou internet estavel pode derrubar acesso aos PDFs.
- NAS sem backup nao substitui politica real de recuperacao.
- Expor protocolos desnecessarios aumenta superficie de ataque.
- URLs publicas precisam ser estaveis para nao quebrar links no app.

## Mitigacoes

- Priorizar VPS simples se houver orcamento minimo.
- Se usar servidor local, configurar no-break e rotina de backup externo.
- Publicar apenas HTTPS e bloquear acessos administrativos desnecessarios.
- Definir padrao de nomes e revisao de publicacao para evitar duplicidade.

## Impacto no projeto atual

Arquivos mais relevantes para a feature no repositorio:

- [src/app/(tabs)/layout.tsx](src/app/(tabs)/layout.tsx)
- [src/app/api/devocional-hoje/route.ts](src/app/api/devocional-hoje/route.ts)
- [src/app/api/pedidos-oracao/route.ts](src/app/api/pedidos-oracao/route.ts)
- [src/components/StudyCard.tsx](src/components/StudyCard.tsx)
- [src/services/studies.ts](src/services/studies.ts)
- [src/types/index.ts](src/types/index.ts)
- [next.config.ts](next.config.ts)

## Recomendacoes tecnicas para o MVP

- Nao integrar o app diretamente com a API do SFTPGo no primeiro momento.
- Usar um catalogo proprio no app para manter simplicidade.
- Usar URLs publicas estaveis dos PDFs no MVP.
- Evitar precarregar todos os PDFs no PWA.
- Medir experiencia em mobile antes de adotar uma lib pesada de PDF.

## Checklist de validacao

1. Subir 3 PDFs de teste no SFTPGo.
2. Validar acesso publico via HTTPS.
3. Validar abertura em desktop e celular.
4. Validar fallback de download.
5. Validar funcionamento com internet lenta.
6. Validar cache offline do catalogo.
7. Testar backup e restauracao de um arquivo removido.

## Decisao recomendada

Essa e a opcao mais indicada para o MVP da igreja. Ela entrega o necessario com menor custo, menor complexidade e menor risco de manutencao. Se a biblioteca crescer ou surgir a necessidade de upload/admin automatizado, a arquitetura ainda permite evoluir sem quebrar a API e a UI do app.