export type TeamMember = {
  name: string;
  role: string;
  qualification: string;
  bio: string;
  photo: string | null;
};

// Substituir o lorem ipsum e adicionar os retratos quando cada membro enviar seu texto.
const placeholderBio = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.';

export const team: TeamMember[] = [
  { name: 'Lucas Ferraz', role: 'Desenvolvedor', qualification: 'Engenharia da Computação', bio: placeholderBio, photo: null },
  { name: 'Gabriel Cavalcanti', role: 'Desenvolvedor', qualification: 'Engenharia da Computação', bio: placeholderBio, photo: null },
  { name: 'Maria Bianca', role: 'Desenvolvedora', qualification: 'Engenharia da Computação', bio: placeholderBio, photo: null },
  { name: 'Pedro Ventura', role: 'Desenvolvedor', qualification: 'Engenharia da Computação', bio: placeholderBio, photo: null },
  { name: 'Andreza Estevam', role: 'Product Owner', qualification: 'Advocacia', bio: placeholderBio, photo: null },
];
