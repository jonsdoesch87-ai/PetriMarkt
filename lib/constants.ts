// Swiss Cantons
export const CANTONS = [
  'AG', // Aargau
  'AI', // Appenzell Innerrhoden
  'AR', // Appenzell Ausserrhoden
  'BE', // Bern
  'BL', // Basel-Landschaft
  'BS', // Basel-Stadt
  'FR', // Freiburg
  'GE', // Genf
  'GL', // Glarus
  'GR', // Graubünden
  'JU', // Jura
  'LU', // Luzern
  'NE', // Neuenburg
  'NW', // Nidwalden
  'OW', // Obwalden
  'SG', // St. Gallen
  'SH', // Schaffhausen
  'SO', // Solothurn
  'SZ', // Schwyz
  'TG', // Thurgau
  'TI', // Tessin
  'UR', // Uri
  'VD', // Waadt
  'VS', // Wallis
  'ZG', // Zug
  'ZH', // Zürich
] as const;

export const CANTON_NAMES: Record<string, string> = {
  AG: 'Aargau',
  AI: 'Appenzell Innerrhoden',
  AR: 'Appenzell Ausserrhoden',
  BE: 'Bern',
  BL: 'Basel-Landschaft',
  BS: 'Basel-Stadt',
  FR: 'Freiburg',
  GE: 'Genf',
  GL: 'Glarus',
  GR: 'Graubünden',
  JU: 'Jura',
  LU: 'Luzern',
  NE: 'Neuenburg',
  NW: 'Nidwalden',
  OW: 'Obwalden',
  SG: 'St. Gallen',
  SH: 'Schaffhausen',
  SO: 'Solothurn',
  SZ: 'Schwyz',
  TG: 'Thurgau',
  TI: 'Tessin',
  UR: 'Uri',
  VD: 'Waadt',
  VS: 'Wallis',
  ZG: 'Zug',
  ZH: 'Zürich',
};

// Categories for fishing articles
export const CATEGORIES = [
  'Ruten',
  'Rollen',
  'Köder',
  'Zubehör',
  'Bekleidung',
  'Boote',
  'Sonstiges',
] as const;

// Condition options
export const CONDITIONS = ['Neu', 'Gebraucht', 'Defekt'] as const;

export type Canton = typeof CANTONS[number];
export type Category = typeof CATEGORIES[number];
export type Condition = typeof CONDITIONS[number];
