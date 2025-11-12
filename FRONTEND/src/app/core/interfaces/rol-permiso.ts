export interface RolPermiso {
    id: number,
    rolId: number,
    rolNombre?: string | null,
    permisoId: number,
    permisoNombre?: string | null,
    activo: number,
    activoNombre?: string | null
}