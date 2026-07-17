-- Migration: add_rbac
-- Description: Add Role, Permission, RolePermission models and roleId to User

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    es_sistema BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    recurso VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create roles_permissions join table
CREATE TABLE IF NOT EXISTS roles_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Add role_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID;
ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- Insert all permissions
INSERT INTO permissions (codigo, recurso, accion, nombre) VALUES
('dashboard:consultar', 'dashboard', 'consultar', 'Consultar Dashboard'),
('rupl:consultar', 'rupl', 'consultar', 'Consultar RUPL'),
('rupl:crear', 'rupl', 'crear', 'Crear productor RUPL'),
('rupl:editar', 'rupl', 'editar', 'Editar productor RUPL'),
('rupl:eliminar', 'rupl', 'eliminar', 'Eliminar/desactivar productor RUPL'),
('catalogo:consultar', 'catalogo', 'consultar', 'Consultar catálogo'),
('compras:consultar', 'compras', 'consultar', 'Consultar compras'),
('compras:crear', 'compras', 'crear', 'Crear orden de compra'),
('compras:editar', 'compras', 'editar', 'Editar orden de compra'),
('compras:eliminar', 'compras', 'eliminar', 'Anular orden de compra'),
('certificaciones:consultar', 'certificaciones', 'consultar', 'Consultar certificaciones'),
('certificaciones:crear', 'certificaciones', 'crear', 'Crear certificación'),
('certificaciones:editar', 'certificaciones', 'editar', 'Editar certificación'),
('certificaciones:eliminar', 'certificaciones', 'eliminar', 'Eliminar certificación'),
('minutas:consultar', 'minutas', 'consultar', 'Consultar minutas'),
('minutas:crear', 'minutas', 'crear', 'Crear minuta'),
('minutas:editar', 'minutas', 'editar', 'Editar minuta'),
('ruedas:consultar', 'ruedas', 'consultar', 'Consultar ruedas de negocio'),
('ruedas:crear', 'ruedas', 'crear', 'Crear rueda de negocio'),
('ruedas:editar', 'ruedas', 'editar', 'Editar rueda de negocio'),
('ruedas:eliminar', 'ruedas', 'eliminar', 'Eliminar rueda de negocio'),
('incidencias:consultar', 'incidencias', 'consultar', 'Consultar incidencias'),
('incidencias:crear', 'incidencias', 'crear', 'Reportar incidencia'),
('incidencias:editar', 'incidencias', 'editar', 'Editar incidencia'),
('incidencias:eliminar', 'incidencias', 'eliminar', 'Eliminar incidencia'),
('actas_recibo:consultar', 'actas_recibo', 'consultar', 'Consultar actas de recibo'),
('actas_recibo:crear', 'actas_recibo', 'crear', 'Crear acta de recibo'),
('actas_recibo:editar', 'actas_recibo', 'editar', 'Editar acta de recibo'),
('actas_recibo:eliminar', 'actas_recibo', 'eliminar', 'Eliminar acta de recibo'),
('notificaciones:consultar', 'notificaciones', 'consultar', 'Consultar notificaciones'),
('reportes:consultar', 'reportes', 'consultar', 'Consultar reportes'),
('reportes:exportar', 'reportes', 'exportar', 'Exportar reportes'),
('configuracion:consultar', 'configuracion', 'consultar', 'Consultar configuración'),
('configuracion:editar', 'configuracion', 'editar', 'Editar configuración'),
('usuarios:consultar', 'usuarios', 'consultar', 'Consultar usuarios'),
('usuarios:crear', 'usuarios', 'crear', 'Crear usuario'),
('usuarios:editar', 'usuarios', 'editar', 'Editar usuario'),
('usuarios:eliminar', 'usuarios', 'eliminar', 'Eliminar usuario'),
('roles:consultar', 'roles', 'consultar', 'Consultar roles'),
('roles:crear', 'roles', 'crear', 'Crear rol'),
('roles:editar', 'roles', 'editar', 'Editar rol'),
('roles:eliminar', 'roles', 'eliminar', 'Eliminar rol'),
('tenants:consultar', 'tenants', 'consultar', 'Consultar entidades'),
('tenants:crear', 'tenants', 'crear', 'Crear entidad'),
('tenants:editar', 'tenants', 'editar', 'Editar entidad'),
('tenants:eliminar', 'tenants', 'eliminar', 'Eliminar entidad')
ON CONFLICT (codigo) DO NOTHING;

-- Insert system roles
INSERT INTO roles (codigo, nombre, descripcion, es_sistema) VALUES
('super_admin', 'Super Administrador', 'Acceso total al sistema', TRUE),
('admin_entidad', 'Administrador de Entidad', 'Gestiona su entidad y usuarios', TRUE),
('operador', 'Operador', 'Gestiona RUPL, compras y catálogo', TRUE),
('productor', 'Productor', 'Acceso limitado a su perfil y productos', TRUE),
('interventor', 'Interventor', 'Verifica entregas y actas de recibo', TRUE),
('auditor', 'Auditor', 'Consulta reportes y auditoría', TRUE),
('mesa_tecnica', 'Mesa Técnica', 'Gestiona minutas y certificaciones', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- Assign permissions to roles
-- Super Admin: ALL
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.codigo = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin Entidad: everything except roles and tenants
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.codigo = 'admin_entidad'
AND p.recurso NOT IN ('roles', 'tenants')
ON CONFLICT DO NOTHING;

-- Operador: rupl, catalogo, compras, dashboard, notificaciones, incidencias, actas_recibo
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.codigo = 'operador'
AND p.recurso IN ('dashboard', 'rupl', 'catalogo', 'compras', 'notificaciones', 'incidencias', 'actas_recibo')
ON CONFLICT DO NOTHING;

-- Productor: dashboard:consultar, rupl:consultar, notificaciones:consultar
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.codigo = 'productor'
AND ((p.recurso = 'dashboard' AND p.accion = 'consultar')
  OR (p.recurso = 'rupl' AND p.accion = 'consultar')
  OR (p.recurso = 'notificaciones' AND p.accion = 'consultar'))
ON CONFLICT DO NOTHING;

-- Interventor: dashboard, compras:consultar, actas_recibo, incidencias, notificaciones
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.codigo = 'interventor'
AND ((p.recurso = 'dashboard' AND p.accion = 'consultar')
  OR (p.recurso = 'compras' AND p.accion = 'consultar')
  OR (p.recurso = 'actas_recibo')
  OR (p.recurso = 'incidencias')
  OR (p.recurso = 'notificaciones' AND p.accion = 'consultar'))
ON CONFLICT DO NOTHING;

-- Auditor: dashboard, reportes
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.codigo = 'auditor'
AND p.recurso IN ('dashboard', 'reportes')
ON CONFLICT DO NOTHING;

-- Mesa Técnica: dashboard, minutas, certificaciones, reportes, notificaciones
INSERT INTO roles_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.codigo = 'mesa_tecnica'
AND p.recurso IN ('dashboard', 'minutas', 'certificaciones', 'reportes', 'notificaciones')
ON CONFLICT DO NOTHING;

-- Link existing users to their roles
UPDATE users u SET role_id = r.id
FROM roles r
WHERE r.codigo = u.rol::text AND u.role_id IS NULL;
