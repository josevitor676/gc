export interface GrupoCrescimento {
  id: number;
  nome: string;
  dia: string;
  hora: string;
  lat: number;
  lng: number;
  /** Telefone para exibição, ex.: "(44) 98815-9768" */
  whatsapp: string;
}

export const GRUPOS_CRESCIMENTO: GrupoCrescimento[] = [
  {
    id: 1,
    nome: "G.C IPVO",
    dia: "Quarta-feira",
    hora: "20:00",
    lat: -23.4289951,
    lng: -51.9166027,
    whatsapp: "(44) 98815-9768",
  },
  {
    id: 2,
    nome: "G.C Cidade Alta",
    dia: "Segunda-feira",
    hora: "20:00",
    lat: -23.4655815,
    lng: -51.917183,
    whatsapp: "(44) 99125-9856",
  },
  {
    id: 3,
    nome: "G.C Novo Horizonte",
    dia: "Terça-feira",
    hora: "20:00",
    lat: -23.4322688,
    lng: -51.9357089,
    whatsapp: "(44) 99973-1071",
  },
  {
    id: 4,
    nome: "G.C Mandacarú",
    dia: "Terça-feira",
    hora: "20:00",
    lat: -23.3793951,
    lng: -51.9535897,
    whatsapp: "(44) 99103-6679",
  },
  {
    id: 5,
    nome: "G.C Jd. Itália II",
    dia: "Segunda-feira",
    hora: "19:30",
    lat: -23.4534292,
    lng: -51.9464307,
    whatsapp: "(44) 99979-1147",
  },
  {
    id: 6,
    nome: "G.C Novo Horizonte II",
    dia: "Terça-feira",
    hora: "19:30",
    lat: -23.4444127,
    lng: -51.93521,
    whatsapp: "(44) 99948-1127",
  },
  {
    id: 7,
    nome: "G.C Jovens",
    dia: "Terça-feira",
    hora: "20:00",
    lat: -23.4289582,
    lng: -51.9165211,
    whatsapp: "(44) 99851-0135",
  },
  {
    id: 8,
    nome: "G.C Guaiapó",
    dia: "Segunda-feira",
    hora: "20:00",
    lat: -23.4075631,
    lng: -51.875699,
    whatsapp: "(44) 99732-7947",
  },
  {
    id: 10,
    nome: "G.C Zona 08",
    dia: "Segunda-feira",
    hora: "20:00",
    lat: -23.4547915,
    lng: -51.9221932,
    whatsapp: "(44) 99142-6061",
  },
  {
    id: 11,
    nome: "G.C Noiva de Cristo",
    dia: "Terça-feira",
    hora: "19:30",
    lat: -23.443599,
    lng: -51.9122646,
    whatsapp: "(44) 99973-5551",
  },
  {
    id: 12,
    nome: "G.C Centro",
    dia: "Terça-feira",
    hora: "20:00",
    lat: -23.4234632,
    lng: -51.9337852,
    whatsapp: "(44) 98818-3121",
  },
  {
    id: 13,
    nome: "G.C Sarandi",
    dia: "Terça-feira",
    hora: "20:00",
    lat: -23.4276321,
    lng: -51.8713384,
    whatsapp: "(44) 99926-6161",
  },
  {
    id: 14,
    nome: "G.C Jd. América",
    dia: "Terça-feira",
    hora: "20:00",
    lat: -23.453021,
    lng: -51.9172107,
    whatsapp: "(44) 99934-9977",
  },
  {
    id: 15,
    nome: "G.C Alvorada",
    dia: "Segunda-feira",
    hora: "20:00",
    lat: -23.4037802,
    lng: -51.9101585,
    whatsapp: "(44) 99854-6287",
  },
];

/** Converte "(44) 98815-9768" nos dígitos internacionais usados pelo wa.me */
export function whatsappDigits(display: string): string {
  return `55${display.replace(/\D/g, "")}`;
}
