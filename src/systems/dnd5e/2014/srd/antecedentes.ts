import type { AntecedenteSrd } from "./tipos";

// O SRD 5.1 traz um único antecedente. Os demais podem ser criados como antecedente personalizado.
export const ANTECEDENTES_SRD: AntecedenteSrd[] = [
  {
    id: "acolito",
    nome: "Acólito",
    descricao: "Você passou a vida a serviço de um templo, em orações, rituais e cuidado com os fiéis.",
    pericias: ["intuicao", "religiao"],
    idiomasExtras: 2,
    tracos: [
      {
        nome: "Abrigo dos Fiéis",
        descricao:
          "Você e seus companheiros podem receber cura e cuidados em templos da sua fé, e contar com o apoio dos sacerdotes, sem pagar pelos serviços.",
      },
    ],
  },
];
