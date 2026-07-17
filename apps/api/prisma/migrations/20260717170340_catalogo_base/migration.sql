-- AlterEnum: add hortaliza, miel, procesado to CategoriaProducto
ALTER TYPE "CategoriaProducto" ADD VALUE 'hortaliza';
ALTER TYPE "CategoriaProducto" ADD VALUE 'miel';
ALTER TYPE "CategoriaProducto" ADD VALUE 'procesado';

-- CreateTable: productos_base
CREATE TABLE "productos_base" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "codigo_unspsc" VARCHAR(20),
    "codigo_sipsa" VARCHAR(20),
    "nombre" VARCHAR(255) NOT NULL,
    "categoria" "CategoriaProducto" NOT NULL,
    "unidad_medida_defecto" "UnidadMedida" NOT NULL,
    "atributos_schema" JSONB,
    "certificaciones_requeridas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "foto_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "productos_base_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "productos_base_tenant_id_nombre_key" UNIQUE ("tenant_id", "nombre")
);

-- CreateTable: unspsc
CREATE TABLE "unspsc" (
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "nivel" INTEGER NOT NULL,
    "padre_id" VARCHAR(20),
    CONSTRAINT "unspsc_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable: sipsa
CREATE TABLE "sipsa" (
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "categoria" "CategoriaProducto" NOT NULL,
    CONSTRAINT "sipsa_pkey" PRIMARY KEY ("codigo")
);

-- AlterTable: productos_ofrecidos - add new columns
ALTER TABLE "productos_ofrecidos"
    ADD COLUMN "producto_base_id" UUID,
    ADD COLUMN "atributos" JSONB,
    ADD COLUMN "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "estado_oferta" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    ADD COLUMN "revisado_por" UUID,
    ADD COLUMN "revision_nota" TEXT;

-- CreateIndex: productos_ofrecidos
CREATE INDEX IF NOT EXISTS "productos_ofrecidos_producto_base_id_idx" ON "productos_ofrecidos"("producto_base_id");

-- AddForeignKey
ALTER TABLE "productos_ofrecidos"
    ADD CONSTRAINT "productos_ofrecidos_producto_base_id_fkey"
    FOREIGN KEY ("producto_base_id") REFERENCES "productos_base"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: presentaciones_producto
CREATE TABLE "presentaciones_producto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "producto_ofrecido_id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "volumen" DECIMAL(12,2) NOT NULL,
    "unidad_medida" "UnidadMedida" NOT NULL,
    "precio" DECIMAL(14,2) NOT NULL,
    "stock" DECIMAL(12,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "presentaciones_producto_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "presentaciones_producto_producto_ofrecido_id_fkey"
        FOREIGN KEY ("producto_ofrecido_id")
        REFERENCES "productos_ofrecidos"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: historial_precios
CREATE TABLE "historial_precios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "producto_ofrecido_id" UUID NOT NULL,
    "precio_anterior" DECIMAL(14,2),
    "precio_nuevo" DECIMAL(14,2) NOT NULL,
    "motivo" VARCHAR(255),
    "cambiado_por" UUID NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_precios_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "historial_precios_producto_ofrecido_id_fkey"
        FOREIGN KEY ("producto_ofrecido_id")
        REFERENCES "productos_ofrecidos"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
