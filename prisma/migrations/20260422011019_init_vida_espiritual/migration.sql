-- CreateTable
CREATE TABLE "devocionais" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "versiculo" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "reflexao" TEXT NOT NULL,
    "aplicacao" TEXT NOT NULL,
    "oracao" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devocionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_oracao" (
    "id" SERIAL NOT NULL,
    "solicitante" TEXT,
    "pedido" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pedidos_oracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versiculo_cache" (
    "id" SERIAL NOT NULL,
    "data" DATE NOT NULL,
    "versiculo" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "livro" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "versiculo_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devocionais_data_key" ON "devocionais"("data");

-- CreateIndex
CREATE UNIQUE INDEX "versiculo_cache_data_key" ON "versiculo_cache"("data");
