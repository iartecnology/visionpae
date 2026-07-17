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

  async listar(filtros: BuscarProductorDto, tenantId: string) {
    const where: any = { tenantId };

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

  async obtener(id: string, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({
      where: { id, tenantId },
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

  async agregarProducto(productorId: string, data: CrearProductoOfrecidoDto, tenantId: string) {
    const productor = await this.prisma.productor.findFirst({ where: { id: productorId, tenantId } });
    if (!productor) throw new NotFoundException('Productor no encontrado');

    const { presentaciones, ...productData } = data;

    const producto = await this.prisma.productoOfrecido.create({
      data: {
        ...productData as any,
        productorId,
        tenantId,
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

  async listarProductos(productorId: string, tenantId: string, page = 1, limit = 50) {
    const where = { productorId, tenantId, activo: true };
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

  async actualizarProducto(id: string, data: any, tenantId: string) {
    const producto = await this.prisma.productoOfrecido.findFirst({ where: { id, tenantId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    return this.prisma.productoOfrecido.update({
      where: { id },
      data: data as any,
    });
  }

  async eliminarProducto(id: string, tenantId: string) {
    const producto = await this.prisma.productoOfrecido.findFirst({ where: { id, tenantId } });
    if (!producto) throw new NotFoundException('Producto no encontrado');

    return this.prisma.productoOfrecido.update({
      where: { id },
      data: { activo: false },
    });
  }

  async buscarProductos(filtros: {
    q?: string;
    categoria?: string;
    codigoMunicipio?: string;
    tenantId: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { activo: true, tenantId: filtros.tenantId };
    if (filtros.categoria) where.categoria = filtros.categoria;
    if (filtros.q) where.nombre = { contains: filtros.q, mode: 'insensitive' };

    if (filtros.codigoMunicipio) {
      where.productor = { codigoMunicipio: filtros.codigoMunicipio };
    }

    const total = await this.prisma.productoOfrecido.count({ where });
    const items = await this.prisma.productoOfrecido.findMany({
      where,
      include: {
        productor: {
          select: {
            razonSocial: true, nombreComercial: true, codigoMunicipio: true, calificacionPromedio: true,
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
