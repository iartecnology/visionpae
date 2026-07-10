import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de prueba...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'tunja' },
    update: {},
    create: {
      nombre: 'Municipio de Tunja',
      slug: 'tunja',
      codigoDane: '15001',
      departamento: 'Boyacá',
      tipo: 'municipio',
      config: {
        porcentajeMeta: 30,
        periodoEvaluacion: 'trimestral',
        tolerancia: 2,
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pae.co' },
    update: {},
    create: {
      email: 'admin@pae.co',
      passwordHash: '$2b$10$placeholder',
      nombreCompleto: 'Admin PAE Tunja',
      tipoDocumento: 'CC',
      numeroDocumento: '123456789',
      rol: 'admin_entidad',
      tenantId: tenant.id,
    },
  });

  const operador = await prisma.user.upsert({
    where: { email: 'operador@pae.co' },
    update: {},
    create: {
      email: 'operador@pae.co',
      passwordHash: '$2b$10$placeholder',
      nombreCompleto: 'Operador PAE',
      tipoDocumento: 'CC',
      numeroDocumento: '987654321',
      rol: 'operador',
      tenantId: tenant.id,
    },
  });

  const productor = await prisma.productor.upsert({
    where: { tenantId_numeroDocumento: { tenantId: tenant.id, numeroDocumento: '111111111' } },
    update: {},
    create: {
      tenantId: tenant.id,
      tipoPersona: 'natural',
      tipoDocumento: 'CC',
      numeroDocumento: '111111111',
      razonSocial: 'Juan Pérez',
      nombreComercial: 'Productos de la Vereda',
      telefonoContacto: '3101234567',
      codigoVereda: '15001001',
      codigoMunicipio: '15001',
      codigoDepartamento: '15',
      estrato: 'campesino',
      estado: 'activo',
    },
  });

  await prisma.productoOfrecido.createMany({
    data: [
      {
        productorId: productor.id,
        tenantId: tenant.id,
        nombre: 'Papa pastusa',
        categoria: 'tuberculos',
        unidadMedida: 'kg',
        volumenDisponible: 500,
        precioReferencia: 2000,
        estacionalidad: [
          { mes: 1, disponible: true, volumenEstimado: 400 },
          { mes: 2, disponible: true, volumenEstimado: 500 },
        ],
        activo: true,
      },
      {
        productorId: productor.id,
        tenantId: tenant.id,
        nombre: 'Maíz',
        categoria: 'granos',
        unidadMedida: 'kg',
        volumenDisponible: 300,
        precioReferencia: 3500,
        estacionalidad: [
          { mes: 1, disponible: true, volumenEstimado: 300 },
        ],
        activo: true,
      },
    ],
  });

  const contrato = await prisma.contratoMarco.create({
    data: {
      tenantId: tenant.id,
      numero: 'PAE-2024-001',
      operadorId: operador.id,
      objeto: 'Suministro de alimentos para PAE Tunja 2024',
      periodoInicio: new Date('2024-01-01'),
      periodoFin: new Date('2024-12-31'),
      valorTotal: 120000000,
      presupuestoComprasLocales: 36000000,
      tipo: 'anual',
      estado: 'activo',
      createdBy: admin.id,
    },
  });

  const orden1 = await prisma.ordenCompra.create({
    data: {
      tenantId: tenant.id,
      contratoId: contrato.id,
      numero: 'OC-2024-001',
      productorId: productor.id,
      fechaEmision: new Date('2024-01-15'),
      fechaEntregaProgramada: new Date('2024-01-20'),
      valorTotal: 1200000,
      esLocal: true,
      fundamentoLegal: 'Art. 2 Ley 2046',
      estado: 'entregada',
      creadoPor: operador.id,
    },
  });

  await prisma.itemOrdenCompra.create({
    data: {
      ordenId: orden1.id,
      productoId: (await prisma.productoOfrecido.findFirst({ where: { tenantId: tenant.id } }))!.id,
      nombreProducto: 'Papa pastusa',
      cantidadSolicitada: 600,
      unidadMedida: 'kg',
      precioUnitario: 2000,
      subtotal: 1200000,
    },
  });

  await prisma.featureFlag.createMany({
    data: [
      { tenantId: tenant.id, flag: 'modulo_minutas', habilitado: true },
      { tenantId: tenant.id, flag: 'modulo_ruedas', habilitado: true },
      { tenantId: tenant.id, flag: 'modulo_certificaciones', habilitado: true },
    ],
  });

  console.log('✅ Seed completado');
  console.log(`   Tenant: ${tenant.nombre}`);
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Productor: ${productor.razonSocial}`);
  console.log(`   Contrato: ${contrato.numero}`);
  console.log(`   Órdenes: ${orden1.numero}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
