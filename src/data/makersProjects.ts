export interface Maker {
  name: string;
  role: string;
}

export interface MakersProject {
  id: string;
  name: string;
  description: string;
  icon?: string;          // categoría visual: restaurant | cs | finance | tools | research | data | process
  iconName: string;       // nombre del componente Lucide
  makers: Maker[];
  teams: string[];
  tools: string[];
  process: string;        // '' = por definir
  url: string;
}

export const makersProjects: MakersProject[] = [
  // ── Proyectos con información completa ──────────────────────────────────────
  {
    id: 'bold-pos-web',
    name: 'Bold POS Restaurantes WEB V1.0',
    description: 'Sistema POS especializado para restaurantes.',
    icon: 'restaurant',
    iconName: 'UtensilsCrossed',
    makers: [
      { name: 'Camilo Diaz',  role: 'Senior UX Designer' },
      { name: 'Bryan Nazar',  role: 'PM Bold POS Restaurantes' },
    ],
    teams:   ['UX', 'SaaS'],
    tools:   ['Claude Code', 'Figma'],
    process: 'Prototipado funcional',
    url:     'https://camilodiaz-ux-bold.github.io/bold-pos-web/inicio',
  },
  {
    id: 'bold-pos-app',
    name: 'Bold POS Restaurantes App V1.0',
    description: 'Sistema POS especializado para restaurantes para dispositivos móviles.',
    icon: 'restaurant',
    iconName: 'Smartphone',
    makers: [
      { name: 'Camilo Diaz', role: 'Senior UX Designer' },
      { name: 'Bryan Nazar', role: 'PM Bold POS Restaurantes' },
    ],
    teams:   ['UX', 'SaaS'],
    tools:   ['Claude Code', 'Figma'],
    process: 'Prototipado funcional',
    url:     'https://camilodiaz-ux-bold.github.io/bold-pos-prototipo/dashboard.html',
  },
  {
    id: 'academia-bold-pos',
    name: 'Academia Bold POS',
    description: 'Sistema para capacitación interna y apoyo para clientes de Bold POS.',
    icon: 'cs',
    iconName: 'GraduationCap',
    makers: [
      { name: 'Jeffrey Martinez', role: 'Customer Experience Expert Bold POS' },
      { name: 'Nicolas Baquero',  role: 'CS Manager SaaS' },
      { name: 'Camilo Diaz',      role: 'Senior UX Designer' },
    ],
    teams:   ['CS', 'UX'],
    tools:   ['Claude Code', 'Figma'],
    process: 'Prototipado funcional',
    url:     'https://academia.localizadoc.com/',
  },

  // ── Proyectos registrados — datos por completar ──────────────────────────────
  {
    id: 'finops-tooldeck',
    name: 'FinOps Tool Deck',
    description: 'Herramienta financiera para equipos Bold.',
    icon: 'finance',
    iconName: 'TrendingUp',
    makers:  [],
    teams:   [],
    tools:   [],
    process: '',
    url:     'https://aldemarjerez-crypto.github.io/Finops-Tooldeck/index.html',
  },
  {
    id: 'bold-tools',
    name: 'Bold Tools',
    description: 'Herramientas internas Bold.',
    icon: 'tools',
    iconName: 'Wrench',
    makers:  [],
    teams:   [],
    tools:   [],
    process: '',
    url:     'https://boldtools.lovable.app/',
  },
  {
    id: 'bold-research',
    name: 'Bold Research',
    description: 'Plataforma de investigación Bold.',
    icon: 'research',
    iconName: 'FlaskConical',
    makers:  [],
    teams:   [],
    tools:   [],
    process: '',
    url:     'https://bold-research.vercel.app/',
  },
  {
    id: 'analisis-sdr',
    name: 'Análisis SDR',
    description: 'Dashboard de análisis para equipo SDR.',
    icon: 'data',
    iconName: 'BarChart3',
    makers:  [],
    teams:   ['Data'],
    tools:   [],
    process: 'Ventas',
    url:     'https://sites.google.com/bold.co/analisissdr/dashboard-sdr',
  },
  {
    id: 'roadmap-process',
    name: 'Roadmap Process Automation',
    description: 'Hoja de ruta de automatización de procesos Bold.',
    icon: 'process',
    iconName: 'GitBranch',
    makers:  [],
    teams:   [],
    tools:   [],
    process: '',
    url:     'https://bold-process-automation.github.io/roadmap-process-automation/',
  },
  {
    id: 'boletin-procesos',
    name: 'Boletín Procesos',
    description: 'Boletín interno del equipo de procesos Bold.',
    icon: 'process',
    iconName: 'Newspaper',
    makers:  [],
    teams:   [],
    tools:   [],
    process: '',
    url:     'https://bold-process-automation.github.io/boletin-procesos/',
  },
];
