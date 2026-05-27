export interface Maker {
  name: string;
  role: string;
}

export interface MakersProject {
  id: string;
  name: string;
  description: string;
  makers: Maker[];
  teams: string[];
  tools: string[];
  process: string;
  url: string;
}

export const makersProjects: MakersProject[] = [
  {
    id: 'bold-pos-restaurantes',
    name: 'Bold POS Restaurantes',
    description:
      'Sistema de punto de venta pensado para restaurantes: gestión de mesas, comandas en tiempo real, pagos integrados y comprobantes digitales.',
    makers: [
      { name: 'Camilo Díaz', role: 'UX Designer' },
      { name: 'Paula Mendoza', role: 'Tech Lead Frontend' },
    ],
    teams: ['UX', 'SaaS'],
    tools: ['Claude Code', 'Figma'],
    process: 'Capacitación',
    url: '#',
  },
  {
    id: 'bold-dashboard-analytics',
    name: 'Bold Dashboard Analytics',
    description:
      'Panel de reportes avanzados con visualizaciones interactivas de ventas, tendencias diarias y comparativas por periodo para comercios Bold.',
    makers: [
      { name: 'Sebastián Torres', role: 'Data Analyst' },
      { name: 'Laura Gómez', role: 'UX Designer' },
    ],
    teams: ['Data', 'UX'],
    tools: ['Claude Code', 'Notion AI'],
    process: 'Ventas',
    url: '#',
  },
  {
    id: 'bold-onboarding-flow',
    name: 'Bold Onboarding Flow',
    description:
      'Flujo de bienvenida y activación para nuevos comercios: guía paso a paso, validación de documentos y configuración del primer datáfono.',
    makers: [
      { name: 'Valentina Ruiz', role: 'UX Lead' },
      { name: 'Andrés Herrera', role: 'Product Manager' },
    ],
    teams: ['CS', 'UX'],
    tools: ['Figma', 'Cursor'],
    process: 'Onboarding',
    url: '#',
  },
  {
    id: 'bold-soporte-inteligente',
    name: 'Bold Soporte Inteligente',
    description:
      'Asistente de soporte con IA generativa que resuelve las dudas más frecuentes de los comercios y escala automáticamente los casos complejos.',
    makers: [
      { name: 'María Fernanda Ospina', role: 'CS Operations' },
      { name: 'Juan Pablo Mora', role: 'Engineer' },
    ],
    teams: ['CS', 'Plataforma'],
    tools: ['Claude Code', 'Notion AI'],
    process: 'Soporte',
    url: '#',
  },
  {
    id: 'bold-link-pago',
    name: 'Bold Link de Pago',
    description:
      'Generador de links de cobro personalizados para vendedores no presenciales, con seguimiento del estado del pago en tiempo real.',
    makers: [
      { name: 'Carolina Vargas', role: 'Product Designer' },
      { name: 'Diego Salcedo', role: 'Frontend Engineer' },
    ],
    teams: ['SaaS', 'Plataforma'],
    tools: ['Cursor', 'Claude Code'],
    process: 'Ventas',
    url: '#',
  },
  {
    id: 'bold-status-page',
    name: 'Bold Status Page',
    description:
      'Página de estado de servicios en tiempo real para que comercios y equipos internos monitoreen la disponibilidad de la plataforma Bold.',
    makers: [
      { name: 'Camilo Díaz', role: 'UX Designer' },
      { name: 'Felipe Arango', role: 'SRE' },
    ],
    teams: ['Plataforma', 'Data'],
    tools: ['Claude Code', 'Figma'],
    process: 'Soporte',
    url: '/status',
  },
];
