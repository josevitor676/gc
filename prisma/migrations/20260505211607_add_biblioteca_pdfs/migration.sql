-- CreateTable
CREATE TABLE "biblioteca_pdfs" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "nome_arquivo" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "conteudo_base64" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biblioteca_pdfs_pkey" PRIMARY KEY ("id")
);
