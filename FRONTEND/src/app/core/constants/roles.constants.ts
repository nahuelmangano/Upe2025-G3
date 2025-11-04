export const APP_ROLES = {
  MEDICO: 'Medico',
  RECEPCIONISTA: 'Recepcionista',
  ADMIN: 'Administrador'
} as const;

export type AppRole = typeof APP_ROLES[keyof typeof APP_ROLES];