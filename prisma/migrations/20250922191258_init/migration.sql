-- CreateTable
CREATE TABLE "pontos_descarte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_do_ponto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "materiais_aceitos" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
