import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de prueba...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // ============================================================
  // SUPER ADMIN (global, sin tenant específico)
  // ============================================================
  // Creamos un tenant "placeholder" para el super_admin o bien
  // permitimos super_admin sin tunja.  Lo más limpio es crear
  // un tenant "sistema".
  const sistemaTenant = await prisma.tenant.upsert({
    where: { slug: 'sistema' },
    update: {},
    create: {
      nombre: 'Plataforma VisionPAE',
      slug: 'sistema',
      codigoDane: '00000',
      departamento: 'Nacional',
      tipo: 'operador_pae',
      config: {},
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: sistemaTenant.id, email: 'superadmin@pae.co' } },
    update: {},
    create: {
      email: 'superadmin@pae.co',
      passwordHash: hashedPassword,
      nombreCompleto: 'Super Admin',
      tipoDocumento: 'CC',
      numeroDocumento: '000000001',
      rol: 'super_admin',
      tenantId: sistemaTenant.id,
    },
  });

  // ============================================================
  // CATÁLOGOS TERRITORIALES DANE
  // ============================================================
  const boyaca = await prisma.departamento.upsert({
    where: { codigo: '15' },
    update: {},
    create: { codigo: '15', nombre: 'Boyacá' },
  });

  const cundinamarca = await prisma.departamento.upsert({
    where: { codigo: '25' },
    update: {},
    create: { codigo: '25', nombre: 'Cundinamarca' },
  });

  const tunjaMun = await prisma.municipio.upsert({
    where: { codigo: '15001' },
    update: {},
    create: { codigo: '15001', codigoDepartamento: '15', nombre: 'Tunja' },
  });

  await prisma.municipio.upsert({
    where: { codigo: '15759' },
    update: {},
    create: { codigo: '15759', codigoDepartamento: '15', nombre: 'Tuta' },
  });

  await prisma.municipio.upsert({
    where: { codigo: '15646' },
    update: {},
    create: { codigo: '15646', codigoDepartamento: '15', nombre: 'Samacá' },
  });

  await prisma.vereda.upsert({
    where: { codigo: '15001001' },
    update: {},
    create: { codigo: '15001001', codigoMunicipio: '15001', nombre: 'Vereda Pirgua' },
  });

  await prisma.vereda.upsert({
    where: { codigo: '15001002' },
    update: {},
    create: { codigo: '15001002', codigoMunicipio: '15001', nombre: 'Vereda La Esperanza' },
  });

  await prisma.vereda.upsert({
    where: { codigo: '15001003' },
    update: {},
    create: { codigo: '15001003', codigoMunicipio: '15001', nombre: 'Vereda Runta' },
  });

  // ============================================================
  // TENANT 1: Municipio de Tunja
  // ============================================================
  const tunja = await prisma.tenant.upsert({
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
    where: { tenantId_email: { tenantId: tunja.id, email: 'admin@pae.co' } },
    update: {},
    create: {
      email: 'admin@pae.co',
      passwordHash: hashedPassword,
      nombreCompleto: 'Admin PAE Tunja',
      tipoDocumento: 'CC',
      numeroDocumento: '123456789',
      rol: 'admin_entidad',
      tenantId: tunja.id,
    },
  });

  const operador = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tunja.id, email: 'operador@pae.co' } },
    update: {},
    create: {
      email: 'operador@pae.co',
      passwordHash: hashedPassword,
      nombreCompleto: 'Operador PAE',
      tipoDocumento: 'CC',
      numeroDocumento: '987654321',
      rol: 'operador',
      tenantId: tunja.id,
    },
  });

  // ============================================================
  // TENANT 2: Gobernación de Boyacá
  // ============================================================
  const gobernacion = await prisma.tenant.upsert({
    where: { slug: 'gobernacion-boyaca' },
    update: {},
    create: {
      nombre: 'Gobernación de Boyacá',
      slug: 'gobernacion-boyaca',
      codigoDane: '15000',
      departamento: 'Boyacá',
      tipo: 'secretaria_educacion',
      config: {
        porcentajeMeta: 30,
        periodoEvaluacion: 'semestral',
      },
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: gobernacion.id, email: 'admin@gobernacion.gov.co' } },
    update: {},
    create: {
      email: 'admin@gobernacion.gov.co',
      passwordHash: hashedPassword,
      nombreCompleto: 'Admin Gobernación',
      tipoDocumento: 'CC',
      numeroDocumento: '111111222',
      rol: 'admin_entidad',
      tenantId: gobernacion.id,
    },
  });

  // ============================================================
  // TENANT 3: ICBF Regional Boyacá
  // ============================================================
  const icbf = await prisma.tenant.upsert({
    where: { slug: 'icbf-boyaca' },
    update: {},
    create: {
      nombre: 'ICBF Regional Boyacá',
      slug: 'icbf-boyaca',
      codigoDane: '15002',
      departamento: 'Boyacá',
      tipo: 'secretaria_educacion',
      config: {
        porcentajeMeta: 40,
        periodoEvaluacion: 'mensual',
      },
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: icbf.id, email: 'admin@icbf.gov.co' } },
    update: {},
    create: {
      email: 'admin@icbf.gov.co',
      passwordHash: hashedPassword,
      nombreCompleto: 'Admin ICBF Boyacá',
      tipoDocumento: 'CC',
      numeroDocumento: '222333444',
      rol: 'admin_entidad',
      tenantId: icbf.id,
    },
  });

  const productor = await prisma.productor.upsert({
    where: {
      tenantId_numeroDocumento: { tenantId: tunja.id, numeroDocumento: '111111111' },
    },
    update: {},
    create: {
      tenantId: tunja.id,
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
        tenantId: tunja.id,
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
        tenantId: tunja.id,
        nombre: 'Maíz',
        categoria: 'granos',
        unidadMedida: 'kg',
        volumenDisponible: 300,
        precioReferencia: 3500,
        estacionalidad: [{ mes: 1, disponible: true, volumenEstimado: 300 }],
        activo: true,
      },
    ],
    skipDuplicates: true,
  });

  const contrato = await prisma.contratoMarco.upsert({
    where: { tenantId_numero: { tenantId: tunja.id, numero: 'PAE-2024-001' } },
    update: {},
    create: {
      tenantId: tunja.id,
      numero: 'PAE-2024-001',
      operadorId: operador.id,
      objeto: 'Suministro de alimentos para PAE Tunja 2024',
      periodoInicio: new Date('2024-01-01'),
      periodoFin: new Date('2024-12-31'),
      valorTotal: 120_000_000,
      presupuestoComprasLocales: 36_000_000,
      tipo: 'anual',
      estado: 'activo',
      createdBy: admin.id,
    },
  });

  const papa = await prisma.productoOfrecido.findFirst({
    where: { tenantId: tunja.id, nombre: 'Papa pastusa' },
  });

  await prisma.ordenCompra.upsert({
    where: { tenantId_numero: { tenantId: tunja.id, numero: 'OC-2024-001' } },
    update: {},
    create: {
      tenantId: tunja.id,
      contratoId: contrato.id,
      numero: 'OC-2024-001',
      productorId: productor.id,
      fechaEmision: new Date('2024-01-15'),
      fechaEntregaProgramada: new Date('2024-01-20'),
      valorTotal: 1_200_000,
      esLocal: true,
      fundamentoLegal: 'Art. 2 Ley 2046',
      estado: 'entregada',
      creadoPor: operador.id,
    },
  });

  await prisma.featureFlag.createMany({
    data: [
      { tenantId: tunja.id, flag: 'modulo_minutas', habilitado: true },
      { tenantId: tunja.id, flag: 'modulo_ruedas', habilitado: true },
      { tenantId: tunja.id, flag: 'modulo_certificaciones', habilitado: true },
      { tenantId: gobernacion.id, flag: 'modulo_minutas', habilitado: true },
      { tenantId: gobernacion.id, flag: 'modulo_ruedas', habilitado: true },
      { tenantId: icbf.id, flag: 'modulo_minutas', habilitado: true },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // MÁS PRODUCTORES — Tunja
  // ============================================================
  const productoresTunja = await Promise.all([
    prisma.productor.upsert({
      where: { tenantId_numeroDocumento: { tenantId: tunja.id, numeroDocumento: '222222222' } },
      update: {}, create: {
        tenantId: tunja.id, tipoPersona: 'asociacion', tipoDocumento: 'NIT', numeroDocumento: '222222222',
        razonSocial: 'Asociación Campesina de Samacá', nombreComercial: 'ASCAM',
        telefonoContacto: '3107654321', codigoMunicipio: '15001', codigoDepartamento: '15',
        estrato: 'campesino', estado: 'activo', calificacionPromedio: 4.2, totalVentas: 8500000,
      },
    }),
    prisma.productor.upsert({
      where: { tenantId_numeroDocumento: { tenantId: tunja.id, numeroDocumento: '333333333' } },
      update: {}, create: {
        tenantId: tunja.id, tipoPersona: 'natural', tipoDocumento: 'CC', numeroDocumento: '333333333',
        razonSocial: 'María López', nombreComercial: 'Huerta Doña María',
        telefonoContacto: '3111112222', codigoMunicipio: '15001', codigoDepartamento: '15',
        estrato: 'pequeno', estado: 'activo', calificacionPromedio: 4.5, totalVentas: 3200000,
      },
    }),
    prisma.productor.upsert({
      where: { tenantId_numeroDocumento: { tenantId: tunja.id, numeroDocumento: '444444444' } },
      update: {}, create: {
        tenantId: tunja.id, tipoPersona: 'comunidad_etnica', tipoDocumento: 'CC', numeroDocumento: '444444444',
        razonSocial: 'Comunidad Muisca Hunza', nombreComercial: 'Semillas Muiscas',
        telefonoContacto: '3123334444', codigoMunicipio: '15001', codigoDepartamento: '15',
        estrato: 'campesino', esComunidadEtnica: true, etnia: 'Muisca', estado: 'activo',
      },
    }),
    prisma.productor.upsert({
      where: { tenantId_numeroDocumento: { tenantId: tunja.id, numeroDocumento: '555555555' } },
      update: {}, create: {
        tenantId: tunja.id, tipoPersona: 'natural', tipoDocumento: 'CC', numeroDocumento: '555555555',
        razonSocial: 'Carlos Martínez', nombreComercial: 'Lácteos El Páramo',
        telefonoContacto: '3135556666', codigoMunicipio: '15001', codigoDepartamento: '15',
        estrato: 'mediano', estado: 'activo', calificacionPromedio: 3.8, totalVentas: 15000000,
      },
    }),
  ]);

  // ============================================================
  // MÁS PRODUCTOS
  // ============================================================
  await prisma.productoOfrecido.createMany({
    data: [
      { productorId: productor.id, tenantId: tunja.id, nombre: 'Zanahoria', categoria: 'verdura', unidadMedida: 'kg', volumenDisponible: 400, precioReferencia: 1500, activo: true },
      { productorId: productoresTunja[0].id, tenantId: tunja.id, nombre: 'Fresas', categoria: 'fruta', unidadMedida: 'kg', volumenDisponible: 200, precioReferencia: 5000, activo: true },
      { productorId: productoresTunja[0].id, tenantId: tunja.id, nombre: 'Lechuga', categoria: 'verdura', unidadMedida: 'unidad', volumenDisponible: 800, precioReferencia: 1200, activo: true },
      { productorId: productoresTunja[1].id, tenantId: tunja.id, nombre: 'Huevos campesinos', categoria: 'huevos', unidadMedida: 'unidad', volumenDisponible: 3000, precioReferencia: 800, activo: true },
      { productorId: productoresTunja[1].id, tenantId: tunja.id, nombre: 'Pollo criollo', categoria: 'carnes', unidadMedida: 'kg', volumenDisponible: 80, precioReferencia: 12000, activo: true },
      { productorId: productoresTunja[2].id, tenantId: tunja.id, nombre: 'Quinua', categoria: 'granos', unidadMedida: 'kg', volumenDisponible: 150, precioReferencia: 8500, activo: true },
      { productorId: productoresTunja[3].id, tenantId: tunja.id, nombre: 'Leche entera', categoria: 'lacteo', unidadMedida: 'litro', volumenDisponible: 500, precioReferencia: 2800, activo: true },
      { productorId: productoresTunja[3].id, tenantId: tunja.id, nombre: 'Queso campesino', categoria: 'lacteo', unidadMedida: 'kg', volumenDisponible: 100, precioReferencia: 12000, activo: true },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // MÁS ÓRDENES DE COMPRA
  // ============================================================
  const papa2 = await prisma.productoOfrecido.findFirst({ where: { tenantId: tunja.id, nombre: 'Papa pastusa' } });

  const orden2 = await prisma.ordenCompra.upsert({
    where: { tenantId_numero: { tenantId: tunja.id, numero: 'OC-2024-002' } },
    update: {}, create: {
      tenantId: tunja.id, contratoId: contrato.id, numero: 'OC-2024-002',
      productorId: productoresTunja[0].id, fechaEmision: new Date('2024-02-01'),
      fechaEntregaProgramada: new Date('2024-02-10'), valorTotal: 4_500_000,
      esLocal: true, fundamentoLegal: 'Art. 2 Ley 2046', estado: 'entregada', creadoPor: operador.id,
    },
  });

  const orden3 = await prisma.ordenCompra.upsert({
    where: { tenantId_numero: { tenantId: tunja.id, numero: 'OC-2024-003' } },
    update: {}, create: {
      tenantId: tunja.id, contratoId: contrato.id, numero: 'OC-2024-003',
      productorId: productoresTunja[1].id, fechaEmision: new Date('2024-03-01'),
      fechaEntregaProgramada: new Date('2024-03-10'), valorTotal: 2_800_000,
      esLocal: true, fundamentoLegal: 'Art. 2 Ley 2046', estado: 'emitida', creadoPor: operador.id,
    },
  });

  const orden4 = await prisma.ordenCompra.upsert({
    where: { tenantId_numero: { tenantId: tunja.id, numero: 'OC-2024-004' } },
    update: {}, create: {
      tenantId: tunja.id, contratoId: contrato.id, numero: 'OC-2024-004',
      productorId: productoresTunja[3].id, fechaEmision: new Date('2024-03-15'),
      fechaEntregaProgramada: new Date('2024-03-25'), valorTotal: 5_600_000,
      esLocal: false, fundamentoLegal: 'Excepción art. 5 Ley 2046', estado: 'emitida', creadoPor: operador.id,
    },
  });

  // Items de ordenes
  const p1 = await prisma.productoOfrecido.findFirst({ where: { tenantId: tunja.id, nombre: 'Fresas' } });
  const p2 = await prisma.productoOfrecido.findFirst({ where: { tenantId: tunja.id, nombre: 'Huevos campesinos' } });
  const p3 = await prisma.productoOfrecido.findFirst({ where: { tenantId: tunja.id, nombre: 'Leche entera' } });

  await prisma.itemOrdenCompra.createMany({
    data: [
      { ordenId: orden2.id, productoId: p1!.id, nombreProducto: 'Fresas', cantidadSolicitada: 500, unidadMedida: 'kg', precioUnitario: 5000, subtotal: 2500000, cantidadRecibida: 480, conforme: true },
      { ordenId: orden2.id, productoId: p1!.id, nombreProducto: 'Lechuga', cantidadSolicitada: 800, unidadMedida: 'unidad', precioUnitario: 1200, subtotal: 960000, cantidadRecibida: 800, conforme: true },
      { ordenId: orden3.id, productoId: p2!.id, nombreProducto: 'Huevos campesinos', cantidadSolicitada: 2000, unidadMedida: 'unidad', precioUnitario: 800, subtotal: 1600000 },
      { ordenId: orden3.id, productoId: p2!.id, nombreProducto: 'Pollo criollo', cantidadSolicitada: 50, unidadMedida: 'kg', precioUnitario: 12000, subtotal: 600000 },
      { ordenId: orden4.id, productoId: p3!.id, nombreProducto: 'Leche entera', cantidadSolicitada: 1000, unidadMedida: 'litro', precioUnitario: 2800, subtotal: 2800000 },
      { ordenId: orden4.id, productoId: p3!.id, nombreProducto: 'Queso campesino', cantidadSolicitada: 150, unidadMedida: 'kg', precioUnitario: 12000, subtotal: 1800000 },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // CERTIFICACIONES DE INSUFICIENCIA
  // ============================================================
  const cert1 = await prisma.certificacionInsuficiencia.upsert({
    where: { numeroExpediente: 'CERT-2024-001' },
    update: {}, create: {
      tenantId: tunja.id, numeroExpediente: 'CERT-2024-001', contratoId: contrato.id,
      productoCategoria: 'lacteo', volumenRequeridoMensual: 3000,
      estado: 'aprobada', fechaSolicitud: new Date('2024-02-01'),
      fechaResolucion: new Date('2024-02-15'), resueltoPor: admin.id,
      dictamen: 'Se certifica insuficiencia de oferta local de productos lácteos en el municipio de Tunja. Los productores locales cubren solo el 35% del volumen requerido.',
      periodoInicio: new Date('2024-02-01'), periodoFin: new Date('2024-06-30'), createdBy: admin.id,
    },
  });

  const cert2 = await prisma.certificacionInsuficiencia.upsert({
    where: { numeroExpediente: 'CERT-2024-002' },
    update: {}, create: {
      tenantId: tunja.id, numeroExpediente: 'CERT-2024-002', contratoId: contrato.id,
      productoCategoria: 'carnes', volumenRequeridoMensual: 1500,
      estado: 'en_revision_mesa', fechaSolicitud: new Date('2024-03-10'),
      periodoInicio: new Date('2024-03-10'), periodoFin: new Date('2024-07-31'), createdBy: admin.id,
    },
  });

  await prisma.evidenciaInsuficiencia.createMany({
    data: [
      { certificacionId: cert1.id, tipo: 'consulta_productores', descripcion: 'Consulta a la base del RUPL: solo 3 productores registran lácteos', createdBy: admin.id },
      { certificacionId: cert1.id, tipo: 'brecha_volumen', descripcion: 'Volumen disponible: 1.050 L/mes vs requerido: 3.000 L/mes', createdBy: admin.id, datos: { disponible: 1050, requerido: 3000, porcentaje: 35 } },
      { certificacionId: cert1.id, tipo: 'acta_mesa', descripcion: 'Acta de mesa técnica No. 015 del 12-feb-2024', createdBy: admin.id },
      { certificacionId: cert2.id, tipo: 'consulta_productores', descripcion: 'Solicitud de cotizaciones a productores de pollo', createdBy: admin.id },
    ],
    skipDuplicates: true,
  });

  await prisma.productorReferenciadoNoLocal.createMany({
    data: [
      { certificacionId: cert1.id, nombre: 'Lácteos del Valle', ubicacion: 'Mosquera, Cundinamarca', departamento: 'Cundinamarca', municipio: 'Mosquera', productosOfrecidos: ['Leche entera', 'Queso'], volumenDisponible: 5000, precioReferencia: 2600, justificacion: 'Productor certificado en BPA, volumen suficiente para suplir déficit' },
      { certificacionId: cert1.id, nombre: 'Alpina', ubicacion: 'Sopó, Cundinamarca', departamento: 'Cundinamarca', municipio: 'Sopó', productosOfrecidos: ['Leche entera UHT', 'Yogurt'], volumenDisponible: 10000, precioReferencia: 3200, justificacion: 'Proveedor nacional con capacidad logística' },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // MINUTAS — RECETAS
  // ============================================================
  const receta1 = await prisma.receta.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: tunja.id, nombre: 'Avena con quinua y fruta', categoriaComida: 'desayuno',
      porciones: 1, tiempoPreparacionMin: 15,
      instrucciones: '1. Cocer la quinua en agua por 10 min. 2. Agregar la avena y leche. 3. Cocinar 5 min más. 4. Servir con fruta picada.',
      dificultad: 'baja', temporadaRecomendada: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      etiquetaCultural: ['tradicional'], createdBy: admin.id,
    },
  });

  const receta2 = await prisma.receta.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000002',
      tenantId: tunja.id, nombre: 'Arroz con pollo y verduras', categoriaComida: 'almuerzo',
      porciones: 4, tiempoPreparacionMin: 45,
      instrucciones: '1. Sofreír cebolla y ajo. 2. Agregar pollo troceado y dorar. 3. Añadir arroz y verduras. 4. Cocinar a fuego lento 20 min.',
      dificultad: 'media', temporadaRecomendada: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      etiquetaCultural: ['tradicional'], createdBy: admin.id,
    },
  });

  const receta3 = await prisma.receta.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000003',
      tenantId: tunja.id, nombre: 'Huevos pericos con arepa', categoriaComida: 'desayuno',
      porciones: 1, tiempoPreparacionMin: 10,
      instrucciones: '1. Batir huevos. 2. Sofreír cebolla y tomate picado. 3. Agregar huevos y revolver. 4. Servir con arepa asada.',
      dificultad: 'baja', temporadaRecomendada: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      etiquetaCultural: ['tradicional', 'colombiano'], createdBy: admin.id,
    },
  });

  const receta4 = await prisma.receta.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000004',
      tenantId: tunja.id, nombre: 'Sancocho de pollo', categoriaComida: 'almuerzo',
      porciones: 6, tiempoPreparacionMin: 60,
      instrucciones: '1. Cocer pollo con agua y sal. 2. Agregar papa, yuca, plátano y mazorca. 3. Cocinar 30 min. 4. Servir caliente con arroz.',
      dificultad: 'alta', temporadaRecomendada: [1, 2, 3, 4, 10, 11, 12],
      etiquetaCultural: ['tradicional', 'boyacense'], createdBy: admin.id,
    },
  });

  const receta5 = await prisma.receta.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000005',
      tenantId: tunja.id, nombre: 'Refrigerio: fruta con yogurt', categoriaComida: 'refrigerio',
      porciones: 1, tiempoPreparacionMin: 5,
      instrucciones: 'Lavar y picar la fruta. Servir con yogurt natural.',
      dificultad: 'baja', temporadaRecomendada: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      etiquetaCultural: ['saludable'], createdBy: admin.id,
    },
  });

  // ============================================================
  // MINUTAS — INGREDIENTES
  // ============================================================
  await prisma.ingredienteReceta.createMany({
    data: [
      { recetaId: receta1.id, categoriaProducto: 'granos', nombre: 'Avena en hojuelas', cantidad: 0.05, unidad: 'kg', opcional: false },
      { recetaId: receta1.id, categoriaProducto: 'granos', nombre: 'Quinua', cantidad: 0.03, unidad: 'kg', opcional: false },
      { recetaId: receta1.id, categoriaProducto: 'lacteo', nombre: 'Leche', cantidad: 0.25, unidad: 'litro', opcional: false },
      { recetaId: receta1.id, categoriaProducto: 'fruta', nombre: 'Fresas', cantidad: 0.1, unidad: 'kg', opcional: true, sustitutoPosible: 'Banano' },
      { recetaId: receta2.id, categoriaProducto: 'granos', nombre: 'Arroz', cantidad: 0.3, unidad: 'kg', opcional: false },
      { recetaId: receta2.id, categoriaProducto: 'carnes', nombre: 'Pollo', cantidad: 0.2, unidad: 'kg', opcional: false },
      { recetaId: receta2.id, categoriaProducto: 'verdura', nombre: 'Zanahoria', cantidad: 0.1, unidad: 'kg', opcional: false },
      { recetaId: receta2.id, categoriaProducto: 'verdura', nombre: 'Arveja', cantidad: 0.05, unidad: 'kg', opcional: true },
      { recetaId: receta2.id, categoriaProducto: 'tuberculos', nombre: 'Papa', cantidad: 0.15, unidad: 'kg', opcional: false },
      { recetaId: receta3.id, categoriaProducto: 'huevos', nombre: 'Huevos', cantidad: 2, unidad: 'unidad', opcional: false },
      { recetaId: receta3.id, categoriaProducto: 'tuberculos', nombre: 'Harina de maíz', cantidad: 0.1, unidad: 'kg', opcional: false },
      { recetaId: receta4.id, categoriaProducto: 'carnes', nombre: 'Pollo', cantidad: 0.35, unidad: 'kg', opcional: false },
      { recetaId: receta4.id, categoriaProducto: 'tuberculos', nombre: 'Papa pastusa', cantidad: 0.2, unidad: 'kg', opcional: false },
      { recetaId: receta4.id, categoriaProducto: 'tuberculos', nombre: 'Yuca', cantidad: 0.15, unidad: 'kg', opcional: false },
      { recetaId: receta4.id, categoriaProducto: 'verdura', nombre: 'Plátano verde', cantidad: 0.15, unidad: 'kg', opcional: false },
      { recetaId: receta5.id, categoriaProducto: 'fruta', nombre: 'Manzana', cantidad: 1, unidad: 'unidad', opcional: false },
      { recetaId: receta5.id, categoriaProducto: 'lacteo', nombre: 'Yogurt natural', cantidad: 0.15, unidad: 'litro', opcional: false },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // MINUTAS — PLAN SEMANAL
  // ============================================================
  const planSemanal = await prisma.planSemanal.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000010',
      tenantId: tunja.id, nombre: 'Plan Semanal 1 — Marzo 2024',
      fechaInicio: new Date('2024-03-04'), fechaFin: new Date('2024-03-08'),
      estado: 'publicado', createdBy: admin.id,
      requerimientosNutricionales: { caloriasDiarias: 1800, proteinas: 45, carbohidratos: 250 },
    },
  });

  await prisma.planSemanalItem.createMany({
    data: [
      { planId: planSemanal.id, recetaId: receta1.id, diaSemana: 1, tipoComida: 'desayuno', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta2.id, diaSemana: 1, tipoComida: 'almuerzo', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta5.id, diaSemana: 1, tipoComida: 'refrigerio', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta3.id, diaSemana: 2, tipoComida: 'desayuno', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta4.id, diaSemana: 2, tipoComida: 'almuerzo', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta5.id, diaSemana: 2, tipoComida: 'refrigerio', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta1.id, diaSemana: 3, tipoComida: 'desayuno', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta2.id, diaSemana: 3, tipoComida: 'almuerzo', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta3.id, diaSemana: 4, tipoComida: 'desayuno', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta4.id, diaSemana: 4, tipoComida: 'almuerzo', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta1.id, diaSemana: 5, tipoComida: 'desayuno', porcionesEstimadas: 100 },
      { planId: planSemanal.id, recetaId: receta2.id, diaSemana: 5, tipoComida: 'almuerzo', porcionesEstimadas: 100 },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // RUEDAS DE NEGOCIO
  // ============================================================
  const rueda1 = await prisma.ruedaNegocio.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000020',
      tenantId: tunja.id, nombre: 'I Rueda de Negocios PAE Tunja 2024',
      fecha: new Date('2024-02-20'), lugar: 'Centro de Convenciones Tunja',
      descripcion: 'Primera rueda de negocios del año para conectar productores locales con instituciones educativas.',
      tipo: 'presencial', estado: 'finalizada', createdBy: admin.id,
    },
  });

  const rueda2 = await prisma.ruedaNegocio.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: {}, create: {
      id: '00000000-0000-0000-0000-000000000021',
      tenantId: tunja.id, nombre: 'II Rueda de Negocios — Productores Lácteos',
      fecha: new Date('2024-04-15'), lugar: 'Salón de la Cultura, Tunja',
      descripcion: 'Rueda enfocada en productos lácteos para conectar oferta local con demanda institucional.',
      tipo: 'mixta', estado: 'programada', createdBy: admin.id,
    },
  });

  // ============================================================
  // DEMANDAS DE RUEDA
  // ============================================================
  const demanda1 = await prisma.demandaRueda.create({
    data: {
      ruedaId: rueda1.id, entidadNombre: 'IE Normal Superior Santiago de Tunja',
      entidadMunicipio: 'Tunja',
      productosRequeridos: [
        { producto: 'Papa pastusa', cantidad: 500, unidad: 'kg', periodicidad: 'semanal' },
        { producto: 'Leche entera', cantidad: 200, unidad: 'litros', periodicidad: 'semanal' },
        { producto: 'Huevos', cantidad: 1000, unidad: 'unidades', periodicidad: 'semanal' },
      ],
    },
  });

  const demanda2 = await prisma.demandaRueda.create({
    data: {
      ruedaId: rueda1.id, entidadNombre: 'IE Técnica Industrial Julio Flórez',
      entidadMunicipio: 'Tunja',
      productosRequeridos: [
        { producto: 'Frutas variadas', cantidad: 300, unidad: 'kg', periodicidad: 'semanal' },
        { producto: 'Verduras', cantidad: 400, unidad: 'kg', periodicidad: 'semanal' },
        { producto: 'Pollo', cantidad: 150, unidad: 'kg', periodicidad: 'semanal' },
      ],
    },
  });

  // ============================================================
  // MATCHES OFERTA-DEMANDA
  // ============================================================
  await prisma.matchOfertaDemanda.createMany({
    data: [
      { ruedaId: rueda1.id, demandaId: demanda1.id, productorId: productor.id, productoMatch: 'Papa pastusa', volumenOfrecido: 400, precioOfertado: 2000, estado: 'concretado', matchAutomatico: true },
      { ruedaId: rueda1.id, demandaId: demanda1.id, productorId: productoresTunja[3].id, productoMatch: 'Leche entera', volumenOfrecido: 200, precioOfertado: 2800, estado: 'concretado', matchAutomatico: true },
      { ruedaId: rueda1.id, demandaId: demanda1.id, productorId: productoresTunja[1].id, productoMatch: 'Huevos campesinos', volumenOfrecido: 1000, precioOfertado: 800, estado: 'concretado', matchAutomatico: false },
      { ruedaId: rueda1.id, demandaId: demanda2.id, productorId: productoresTunja[0].id, productoMatch: 'Fresas', volumenOfrecido: 200, precioOfertado: 5000, estado: 'contactado', matchAutomatico: true },
      { ruedaId: rueda1.id, demandaId: demanda2.id, productorId: productoresTunja[1].id, productoMatch: 'Pollo criollo', volumenOfrecido: 80, precioOfertado: 12000, estado: 'propuesto', matchAutomatico: false },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // TRANSACCIONES HISTORIAL
  // ============================================================
  const oc1 = await prisma.ordenCompra.findFirst({ where: { tenantId: tunja.id, numero: 'OC-2024-001' } });
  await prisma.transaccionHistorial.createMany({
    data: [
      { tenantId: tunja.id, productorId: productor.id, ordenId: oc1!.id, tipo: 'venta', monto: 1200000, volumen: 500, fecha: new Date('2024-01-15'), descripcion: 'Venta papa pastusa OC-2024-001' },
      { tenantId: tunja.id, productorId: productoresTunja[0].id, ordenId: orden2.id, tipo: 'venta', monto: 3460000, volumen: 1280, fecha: new Date('2024-02-10'), descripcion: 'Fresas y lechuga OC-2024-002' },
      { tenantId: tunja.id, productorId: productoresTunja[3].id, ordenId: orden4.id, tipo: 'venta', monto: 4600000, volumen: 1150, fecha: new Date('2024-03-25'), descripcion: 'Lácteos OC-2024-004' },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // NOTIFICACIONES
  // ============================================================
  await prisma.notificacion.createMany({
    data: [
      { tenantId: tunja.id, userId: admin.id, tipo: 'alerta_cumplimiento', titulo: 'Alerta de cumplimiento', mensaje: 'El cumplimiento de compras locales está en 28%, por debajo del 30% requerido.', link: '/dashboard/compras/cumplimiento' },
      { tenantId: tunja.id, userId: admin.id, tipo: 'nueva_orden', titulo: 'Nueva orden creada', mensaje: 'Se creó la orden OC-2024-003 para compra de huevos y pollo.', link: '/dashboard/compras/3' },
      { tenantId: tunja.id, userId: operador.id, tipo: 'vencimiento_documento', titulo: 'Documento por vencer', mensaje: 'El certificado BPA de Juan Pérez vence en 15 días.', link: '/dashboard/rupl/1' },
      { tenantId: tunja.id, userId: admin.id, tipo: 'certificacion_resuelta', titulo: 'Certificación aprobada', mensaje: 'La certificación de insuficiencia CERT-2024-001 fue aprobada.', link: '/dashboard/certificaciones/1' },
      { tenantId: tunja.id, userId: admin.id, tipo: 'oferta_rueda', titulo: 'Match propuesto en rueda', mensaje: 'Se encontró un match automático para Pollo criollo en la I Rueda de Negocios.', link: '/dashboard/ruedas/1' },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // INCIDENCIAS DE CAMPO
  // ============================================================
  const ordenEntregada = await prisma.ordenCompra.findFirst({
    where: { tenantId: tunja.id, numero: 'OC-2024-001' },
  });

  await prisma.incidenciaCampo.createMany({
    data: [
      {
        tenantId: tunja.id,
        ordenId: ordenEntregada!.id,
        reportadoPor: operador.id,
        tipo: 'calidad_insuficiente',
        descripcion: 'El 15% de la papa pastusa presentó daños por golpe durante el transporte.',
        fotoUrls: ['https://storage.example.com/incidencias/foto1.jpg'],
        latitud: 5.5432,
        longitud: -73.3615,
        estado: 'resuelta',
        resueltoPor: admin.id,
        resolucion: 'Se aceptó el lote con descuento del 10% sobre el valor facturado.',
        fechaResolucion: new Date('2024-01-22'),
      },
      {
        tenantId: tunja.id,
        ordenId: ordenEntregada!.id,
        reportadoPor: operador.id,
        tipo: 'retraso_entrega',
        descripcion: 'La entrega se realizó 2 días después de la fecha programada.',
        fotoUrls: [],
        estado: 'resuelta',
        resueltoPor: admin.id,
        resolucion: 'Se aplicó cláusula de penalidad del 5% según contrato.',
        fechaResolucion: new Date('2024-01-23'),
      },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // ACTAS DE RECIBO
  // ============================================================
  const incidenciaResuelta = await prisma.incidenciaCampo.findFirst({
    where: { tenantId: tunja.id, tipo: 'calidad_insuficiente' },
  });

  await prisma.actaRecibo.upsert({
    where: { ordenId: ordenEntregada!.id },
    update: {},
    create: {
      tenantId: tunja.id,
      ordenId: ordenEntregada!.id,
      interventorId: operador.id,
      productorId: productor.id,
      fechaVisita: new Date('2024-01-20'),
      geolocalizacion: { lat: 5.5432, lng: -73.3615, precision: 'GPS' },
      itemsVerificados: [
        { producto: 'Papa pastusa', solicitado: 500, recibido: 425, conforme: false, incidenciaId: incidenciaResuelta!.id },
      ],
      firmaInterventorUrl: 'https://storage.example.com/firmas/interventor-oc-001.png',
      firmaProductorUrl: 'https://storage.example.com/firmas/productor-oc-001.png',
      actaPdfUrl: 'https://storage.example.com/actas/acta-oc-001.pdf',
      estado: 'aprobada',
    },
  });

  // ============================================================
  // SINCRONIZACIÓN — DISPOSITIVOS MÓVILES
  // ============================================================
  await prisma.syncBatch.createMany({
    data: [
      {
        tenantId: tunja.id,
        dispositivoId: 'interventor-tablet-001',
        userId: operador.id,
        tipoDispositivo: 'interventor',
        ultimoSyncPull: new Date('2024-03-20T08:00:00Z'),
        ultimoSyncPush: new Date('2024-03-20T08:05:00Z'),
        cambiosPendientes: 0,
        estado: 'synced',
        modelosSincronizados: ['OrdenCompra', 'IncidenciaCampo', 'ActaRecibo'],
      },
      {
        tenantId: tunja.id,
        dispositivoId: 'productor-movil-001',
        userId: admin.id,
        tipoDispositivo: 'productor',
        ultimoSyncPull: new Date('2024-03-19T14:30:00Z'),
        ultimoSyncPush: new Date('2024-03-19T14:32:00Z'),
        cambiosPendientes: 2,
        estado: 'pending_sync',
        modelosSincronizados: ['Productor', 'ProductoOfrecido', 'OrdenCompra'],
      },
    ],
    skipDuplicates: true,
  });

  // ============================================================
  // AUDITORÍA — LOGS
  // ============================================================
  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tunja.id,
        userId: admin.id,
        accion: 'CREAR',
        entidad: 'OrdenCompra',
        entidadId: ordenEntregada!.id,
        datosPrevios: null,
        datosNuevos: { numero: 'OC-2024-001', valorTotal: 1200000, estado: 'emitida' },
        ipOrigen: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Web)',
      },
      {
        tenantId: tunja.id,
        userId: admin.id,
        accion: 'APROBAR',
        entidad: 'CertificacionInsuficiencia',
        entidadId: cert1.id,
        datosPrevios: { estado: 'en_revision_mesa' },
        datosNuevos: { estado: 'aprobada' },
        ipOrigen: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Web)',
      },
      {
        tenantId: tunja.id,
        userId: operador.id,
        accion: 'REGISTRAR',
        entidad: 'IncidenciaCampo',
        entidadId: incidenciaResuelta!.id,
        datosPrevios: null,
        datosNuevos: { tipo: 'calidad_insuficiente' },
        ipOrigen: '10.0.0.5',
        userAgent: 'VisionPAE-Mobile/1.0',
      },
    ],
    skipDuplicates: true,
  });

  console.log('');
  console.log('✅ Seed completado — datos de prueba insertados');
  console.log(`   Usuarios: 5 (super_admin, admin_entidad x3, operador)`);
  console.log(`   Productores: 5 (natural, asociación, comunidad étnica)`);
  console.log(`   Productos: 10 (tuberculos, granos, verduras, frutas, huevos, carnes, lácteos)`);
  console.log(`   Contratos: 1 (PAE-2024-001, $120M)`);
  console.log(`   Órdenes: 4 (3 locales, 1 no-local)`);
  console.log(`   Items: 6 (en 4 órdenes)`);
  console.log(`   Certificaciones: 2 (1 aprobada, 1 en revisión)`);
  console.log(`   Evidencias: 4 + 2 productores referenciados`);
  console.log(`   Recetas: 5 (desayuno, almuerzo, refrigerio)`);
  console.log(`   Ingredientes: 17`);
  console.log(`   Plan semanal: 1 (12 items, 5 días)`);
  console.log(`   Ruedas: 2 (1 finalizada, 1 programada)`);
  console.log(`   Demandas: 2 (IE Normal, IE Industrial)`);
  console.log(`   Matches: 5 (3 concretados, 1 contactado, 1 propuesto)`);
  console.log(`   Transacciones: 3`);
  console.log(`   Departamentos: 2 (Boyacá, Cundinamarca)`);
  console.log(`   Municipios: 3 (Tunja, Tuta, Samacá)`);
  console.log(`   Veredas: 3 (Pirgua, La Esperanza, Runta)`);
  console.log(`   Incidencias: 2 (calidad, retraso)`);
  console.log(`   Actas de recibo: 1 (aprobada)`);
  console.log(`   Sync batches: 2 (synced, pending_sync)`);
  console.log(`   Audit logs: 3 (crear, aprobar, registrar)`);
  console.log(`   Notificaciones: 5`);
  console.log(`   Feature Flags: 6 (en 3 tenants)`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
