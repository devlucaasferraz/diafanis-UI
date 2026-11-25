// Comarcas conferidas nos diretórios oficiais do TJPE e da Corregedoria do TJBA.
// https://portal.tjpe.jus.br/servicos/consultas/comarcas-e-municipios-abrangidos
// https://www.tjba.jus.br/corregedoria/comarcas/
export const regionalCourts = [
  { id: 'petrolina', name: 'Petrolina', state: 'PE' },
  { id: 'afranio', name: 'Afrânio', state: 'PE' },
  { id: 'lagoa-grande', name: 'Lagoa Grande', state: 'PE' },
  { id: 'santa-maria-da-boa-vista', name: 'Santa Maria da Boa Vista', state: 'PE' },
  { id: 'oroco', name: 'Orocó', state: 'PE' },
  { id: 'cabrobo', name: 'Cabrobó', state: 'PE' },
  { id: 'juazeiro', name: 'Juazeiro', state: 'BA' },
  { id: 'sobradinho', name: 'Sobradinho', state: 'BA' },
  { id: 'casa-nova', name: 'Casa Nova', state: 'BA' },
  { id: 'curaca', name: 'Curaçá', state: 'BA' },
] as const;
