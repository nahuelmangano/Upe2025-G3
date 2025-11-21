export interface Permiso {
    id: number,
    nombre: string,
    descripcion: string,
    activo: boolean,
    activoNombre?: string | null
}