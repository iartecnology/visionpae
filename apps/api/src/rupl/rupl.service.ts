import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CrearProductorDto, ActualizarProductorDto, BuscarProductorDto, CrearProductoOfrecidoDto } from './dto';

@Injectable()
export class RuplService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(data: CrearProductorDto, tenantId: string) {
    return this.prisma.productor.create({
      data: {
        ...data as any,
        tenantId,
      },
    });
  }

  async listar(filtros: BuscarProductorDto, _tenantId: string) {
    const where: any = {};

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.tipoPersona) where.tipoPersona = filtros.tipoPersona;
    if (filtros.codigoDepartamento) where.codigoDepartamento = filtros.codigoDepartamento;
    if (filtros.codigoMunicipio) where.codigoMunicipio = filtros.codigoMunicipio;
    if (filtros.codigoVereda) where.codigoVereda = filtros.codigoVereda;

    if (filtros.q) {
      where.OR = [
        { razonSocial: { contains: filtros.q, mode: 'insensitive' } },
        { numeroDocumento: { contains: filtros.q } },
        { nombreComercial: { contains: filtros.q, mode: 'insensitive' } },
      ];
    }

    if (filtros.categoriaProducto) {
      where.productos = {
        some: { categoria: filtros.categoriaProducto, activo: true },
      };
    }

    const total = await this.prisma.productor.count({ where });
    const items = await this.prisma.productor.findMany({
      where,
      include: {
        productos: { where: { activo: true } },
        documentos: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      skip: ((filtros.page ?? 1) - 1) * (filtros.limit ?? 20),
      take: filtros.limit ?? 20,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: items,
      meta: { page: filtros.page, limit: filtros.limit, total },
    };
  }

  async obtener(id: string, _tenantId: string) {
    const productor = await this.prisma.productor.findFirst({
      where: { id },
      include: {
        productos: { where: { activo: true } },
        documentos: { orderBy: { createdAt: 'desc' } },
        transacciones: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!productor) throw new NotFoundException('Productor no encontrado');
    return productor;
  }

  async actualizar(id: string, data: ActualizarProductorDto, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    return this.prisma.productor.update({
      where: { id },
      data: data as any,
    });
  }

  async desactivar(id: string, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    return this.prisma.productor.update({
      where: { id },
      data: { estado: 'inactivo' },
    });
  }

  private async resolverProductor(productorId: string, tenantId: string, roles?: string[]) {
    const isAdmin = roles?.some((r) => ['super_admin', 'admin_entidad'].includes(r));
    const productor = isAdmin
      ? await this.prisma.productor.findUnique({ where: { id: productorId } })
      : await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');
    return productor;
  }

  private normalizarNombre(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  private singular(nombre: string) {
    const n = this.normalizarNombre(nombre);
    if (n.endsWith('ces')) return n.slice(0, -3) + 'z';
    if (n.endsWith('es') && n.length > 3) return n.slice(0, -2);
    if (n.endsWith('s') && n.length > 2) return n.slice(0, -1);
    return n;
  }

  private defaultsAtributos(schema: any): any {
    if (!schema || typeof schema !== 'object') return undefined;
    const out: any = {};
    for (const [key, values] of Object.entries<any>(schema)) {
      if (Array.isArray(values) && values.length) out[key] = values[0];
    }
    return Object.keys(out).length ? out : undefined;
  }

  private async resolverProductoBase(productoBaseId: string | undefined, nombre: string) {
    if (productoBaseId) {
      const base = await this.prisma.productoBase.findUnique({ where: { id: productoBaseId } });
      if (!base) throw new BadRequestException('Producto base no encontrado');
      return base;
    }
    if (!nombre) return null;
    const bases = await this.prisma.productoBase.findMany({ where: { tenantId: null, activo: true } });
    const target = this.normalizarNombre(nombre);
    const byExact = bases.find((b) => this.normalizarNombre(b.nombre) === target);
    if (byExact) return byExact;
    const singularTarget = this.singular(nombre);
    return bases.find((b) => this.normalizarNombre(b.nombre) === singularTarget) || null;
  }

  private async prepararProductoData(data: any) {
    const base = await this.resolverProductoBase(data.productoBaseId, data.nombre ?? '');
    const out: any = { ...data };
    if (base) {
      out.productoBaseId = base.id;
      out.nombre = base.nombre;
      out.categoria = base.categoria;
      out.unidadMedida = out.unidadMedida ?? base.unidadMedidaDefecto;
      if (!out.atributos) out.atributos = this.defaultsAtributos(base.atributosSchema);
    }
    return out;
  }

  async agregarProducto(productorId: string, data: CrearProductoOfrecidoDto, tenantId: string, roles?: string[]) {
    const productor = await this.resolverProductor(productorId, tenantId, roles);
    const isAdmin = roles?.some((r) => ['super_admin', 'admin_entidad'].includes(r));

    const { presentaciones, ...productData } = data;
    const resolved = await this.prepararProductoData(productData);

    const producto = await this.prisma.productoOfrecido.create({
      data: {
        ...resolved as any,
        productorId,
        tenantId: isAdmin ? productor.tenantId : tenantId,
      },
    });

    if (presentaciones?.length) {
      await this.prisma.presentacionProducto.createMany({
        data: presentaciones.map((p) => ({
          productoOfrecidoId: producto.id,
          nombre: p.nombre,
          volumen: p.volumen,
          unidadMedida: p.unidadMedida as any,
          precio: p.precio,
          stock: p.stock,
        })),
      });
    }

    return this.prisma.productoOfrecido.findUnique({
      where: { id: producto.id },
      include: { presentaciones: true },
    });
  }

  async listarProductos(productorId: string, tenantId: string, page = 1, limit = 50, roles?: string[]) {
    const productor = await this.resolverProductor(productorId, tenantId, roles);
    const isAdmin = roles?.some((r) => ['super_admin', 'admin_entidad'].includes(r));
    const where = { productorId, tenantId: isAdmin ? productor.tenantId : tenantId, activo: true };
    const [data, total] = await Promise.all([
      this.prisma.productoOfrecido.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.productoOfrecido.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  // ---- Documentos ----

  async agregarDocumento(productorId: string, data: any, tenantId: string, userId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    return this.prisma.documentoAcreditacion.create({
      data: {
        productorId,
        tipo: data.tipo,
        archivoUrl: data.archivoUrl,
        mimeType: data.mimeType,
        tamanoBytes: data.tamanoBytes,
        fechaExpedicion: new Date(data.fechaExpedicion),
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : null,
        diasAvisoVencimiento: data.diasAvisoVencimiento ?? 30,
      },
    });
  }

  async listarDocumentos(productorId: string, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    return this.prisma.documentoAcreditacion.findMany({
      where: { productorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async eliminarDocumento(productorId: string, docId: string, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    return this.prisma.documentoAcreditacion.delete({
      where: { id: docId },
    });
  }

  async actualizarDocumento(productorId: string, docId: string, data: any, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    const updateData: any = {};
    if (data.verificado !== undefined) {
      updateData.verificado = data.verificado;
      if (data.verificado) {
        updateData.verificadoPor = data.verificadoPor;
        updateData.verificadoEn = new Date();
      }
    }
    if (data.fechaVencimiento) {
      updateData.fechaVencimiento = new Date(data.fechaVencimiento);
    }

    return this.prisma.documentoAcreditacion.update({
      where: { id: docId },
      data: updateData,
    });
  }

  async mapa(filtros: {
    q?: string;
    categorias?: string[];
    producto?: string;
    codigoMunicipio?: string;
    codigoDepartamento?: string;
    tipoPersona?: string;
    estrato?: string;
    calificacionMin?: number;
    limit?: number;
  }) {
    const where: any = { latitud: { not: null }, longitud: { not: null }, estado: 'activo' };

    if (filtros.q) {
      where.OR = [
        { razonSocial: { contains: filtros.q, mode: 'insensitive' } },
        { nombreComercial: { contains: filtros.q, mode: 'insensitive' } },
      ];
    }

    if (filtros.codigoDepartamento) where.codigoDepartamento = filtros.codigoDepartamento;
    if (filtros.codigoMunicipio) where.codigoMunicipio = filtros.codigoMunicipio;
    if (filtros.tipoPersona) where.tipoPersona = filtros.tipoPersona;
    if (filtros.estrato) where.estrato = filtros.estrato;
    if (filtros.calificacionMin) where.calificacionPromedio = { gte: filtros.calificacionMin };

    const productoFilter: any = { activo: true };
    if (filtros.categorias?.length) productoFilter.categoria = { in: filtros.categorias };
    if (filtros.producto) productoFilter.nombre = { contains: filtros.producto, mode: 'insensitive' };

    if (filtros.categorias?.length || filtros.producto) {
      where.productos = { some: productoFilter };
    }

    return this.prisma.productor.findMany({
      where,
      select: {
        id: true,
        razonSocial: true,
        nombreComercial: true,
        latitud: true,
        longitud: true,
        calificacionPromedio: true,
        estado: true,
        tipoPersona: true,
        estrato: true,
        codigoMunicipio: true,
        codigoDepartamento: true,
        productos: {
          where: { activo: true },
          select: { id: true, nombre: true, categoria: true, precioReferencia: true, unidadMedida: true },
          take: 5,
        },
      },
      take: filtros.limit ?? 200,
      orderBy: { razonSocial: 'asc' },
    });
  }

  // ---- Calificación ----

  async actualizarCalificacion(productorId: string, calificacion: number, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');
    if (calificacion < 0 || calificacion > 5) throw new BadRequestException('Calificación debe estar entre 0 y 5');

    return this.prisma.productor.update({
      where: { id: productorId },
      data: { calificacionPromedio: calificacion },
    });
  }

  async obtenerCalificacion(productorId: string, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({
      where: { id: productorId, tenantId },
      select: { calificacionPromedio: true },
    });
    if (!productor) throw new NotFoundException('Productor no encontrado');
    return productor;
  }

  // ---- Producto (actualizar estacionalidad) ----

  async obtenerProducto(id: string, tenantId: string, roles?: string[]) {
    const isAdmin = roles?.some((r) => ['super_admin', 'admin_entidad'].includes(r));
    const producto = await this.prisma.productoOfrecido.findFirst({
      where: isAdmin ? { id } : { id, tenantId },
      include: {
        presentaciones: true,
        productoBase: { select: { id: true, nombre: true, fotoUrl: true, atributosSchema: true, unidadMedidaDefecto: true, categoria: true } },
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async actualizarProducto(id: string, data: any, tenantId: string, roles?: string[]) {
    const isAdmin = roles?.some((r) => ['super_admin', 'admin_entidad'].includes(r));
    const producto = await this.prisma.productoOfrecido.findFirst({ where: isAdmin ? { id } : { id, tenantId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const resolved = await this.prepararProductoData(data);
    return this.prisma.productoOfrecido.update({
      where: { id },
      data: resolved as any,
    });
  }

  async eliminarProducto(id: string, tenantId: string, roles?: string[]) {
    const isAdmin = roles?.some((r) => ['super_admin', 'admin_entidad'].includes(r));
    const producto = await this.prisma.productoOfrecido.findFirst({ where: isAdmin ? { id } : { id, tenantId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    return this.prisma.productoOfrecido.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ---- Mis Productos (productor gestiona sus propios productos) ----

  async findProductorByUserId(userId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { userId } });
    if (!productor) throw new NotFoundException('No se encontró un productor asociado a este usuario');
    return productor;
  }

  async misProductos(userId: string, page = 1, limit = 50) {
    const productor = await this.findProductorByUserId(userId);
    const where = { productorId: productor.id, activo: true };
    const [data, total] = await Promise.all([
      this.prisma.productoOfrecido.findMany({
        where,
        include: { presentaciones: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.productoOfrecido.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async crearMiProducto(userId: string, data: CrearProductoOfrecidoDto) {
    const productor = await this.findProductorByUserId(userId);
    const { presentaciones, ...productData } = data;
    const resolved = await this.prepararProductoData(productData);

    const producto = await this.prisma.productoOfrecido.create({
      data: {
        ...resolved as any,
        productorId: productor.id,
        tenantId: productor.tenantId,
      },
    });

    if (presentaciones?.length) {
      await this.prisma.presentacionProducto.createMany({
        data: presentaciones.map((p) => ({
          productoOfrecidoId: producto.id,
          nombre: p.nombre,
          volumen: p.volumen,
          unidadMedida: p.unidadMedida as any,
          precio: p.precio,
          stock: p.stock,
        })),
      });
    }

    return this.prisma.productoOfrecido.findUnique({
      where: { id: producto.id },
      include: { presentaciones: true },
    });
  }

  async actualizarMiProducto(userId: string, prodId: string, data: any) {
    const productor = await this.findProductorByUserId(userId);
    const producto = await this.prisma.productoOfrecido.findFirst({
      where: { id: prodId, productorId: productor.id },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    const resolved = await this.prepararProductoData(data);
    return this.prisma.productoOfrecido.update({
      where: { id: prodId },
      data: resolved as any,
    });
  }

  async eliminarMiProducto(userId: string, prodId: string) {
    const productor = await this.findProductorByUserId(userId);
    const producto = await this.prisma.productoOfrecido.findFirst({
      where: { id: prodId, productorId: productor.id },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    return this.prisma.productoOfrecido.update({
      where: { id: prodId },
      data: { activo: false },
    });
  }

  async obtenerMiProducto(userId: string, prodId: string) {
    const productor = await this.findProductorByUserId(userId);
    const producto = await this.prisma.productoOfrecido.findFirst({
      where: { id: prodId, productorId: productor.id },
      include: {
        presentaciones: true,
        productoBase: { select: { id: true, nombre: true, fotoUrl: true, atributosSchema: true, unidadMedidaDefecto: true, categoria: true } },
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async buscarProductos(filtros: {
    q?: string;
    categoria?: string;
    productoBaseId?: string;
    codigoMunicipio?: string;
    tenantId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { activo: true };
    if (filtros.categoria) where.categoria = filtros.categoria;
    if (filtros.productoBaseId) where.productoBaseId = filtros.productoBaseId;
    if (filtros.q) {
      where.OR = [
        { nombre: { contains: filtros.q, mode: 'insensitive' } },
        { productoBase: { nombre: { contains: filtros.q, mode: 'insensitive' } } },
      ];
    }

    if (filtros.codigoMunicipio) {
      where.productor = { codigoMunicipio: filtros.codigoMunicipio };
    }

    const total = await this.prisma.productoOfrecido.count({ where });
    const items = await this.prisma.productoOfrecido.findMany({
      where,
      include: {
        productoBase: {
          select: { id: true, nombre: true, fotoUrl: true, categoria: true, unidadMedidaDefecto: true },
        },
        productor: {
          select: {
            id: true, razonSocial: true, nombreComercial: true, codigoMunicipio: true, calificacionPromedio: true,
          },
        },
      },
      skip: ((filtros.page ?? 1) - 1) * (filtros.limit ?? 20),
      take: filtros.limit ?? 20,
      orderBy: { updatedAt: 'desc' },
    });

    return { data: items, meta: { page: filtros.page ?? 1, limit: filtros.limit ?? 20, total } };
  }
}
