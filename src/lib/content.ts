export const lessons = [
  {
    id: "hypothesis",
    title: "Defender una hipótesis",
    tag: "Speaking · 20 min",
    rule: "Combina una condición con una consecuencia y explica qué podría cambiar tu conclusión. Una estructura compleja solo ayuda si expresa una idea precisa.",
    example:
      "If autonomous systems were deployed more widely, commanders would need clearer accountability rules. However, responsibility should still depend on the degree of human oversight.",
    prompt:
      "Would removing human drivers make cities safer? Explain your position, then consider a case in which it might not hold.",
    review:
      "¿Has explicado la consecuencia, apoyado tu postura y reconocido una limitación?",
  },
  {
    id: "concession",
    title: "Conceder sin abandonar tu postura",
    tag: "Writing · 20 min",
    rule: "Reconoce una objeción razonable, explica su alcance y vuelve a tu argumento. Evita añadir however sin una relación lógica.",
    example:
      "Although remote work can weaken informal collaboration, this does not necessarily justify a full return to the office. Regular team sessions may address the problem more effectively.",
    prompt:
      "Should public institutions require staff to work in the office every day? Develop an argument and address a credible objection.",
    review: "¿La objeción es real? ¿Tu respuesta aporta una razón nueva?",
  },
  {
    id: "inference",
    title: "Leer lo que se implica",
    tag: "Reading · 15 min",
    rule: "Una inferencia debe apoyarse en el texto. Distingue lo que dice el autor, lo que sugiere y lo que tú sabes del tema.",
    example:
      "The programme met its recruitment target, although half of the new staff left within a year. Meeting the numerical target does not establish long-term success.",
    prompt:
      "Write one conclusion supported by the example and one conclusion that would require more evidence.",
    review: "¿Puedes señalar las palabras que justifican cada inferencia?",
  },
  {
    id: "hedging",
    title: "Matizar afirmaciones",
    tag: "Speaking · 15 min",
    rule: "Usa may, tends to y is likely to para ajustar la fuerza de una afirmación a la evidencia. No conviertas todas las afirmaciones en vagas.",
    example:
      "Investment in public transport may reduce congestion, provided that services are reliable and reach the areas where demand is greatest.",
    prompt:
      "What changes could improve access to healthcare in rural areas? Explain conditions and possible unintended effects.",
    review: "¿Has distinguido posibilidad, probabilidad y certeza?",
  },
];
export const reading = {
  title: "A quieter city, at a cost",
  text: "When a city restricted deliveries in its historic centre to electric vans, noise complaints fell sharply. The council called the policy a success. Small retailers were less enthusiastic: some suppliers introduced minimum orders to cover the cost of replacing their vehicles. A local association proposed shared delivery hubs outside the centre. These could reduce the number of trips, but would require coordination among businesses that normally compete. The debate therefore concerns more than the choice of engine. A quieter street is a clear benefit; who pays for it, and how that cost is distributed, remain unresolved.",
  questions: [
    {
      q: "What is the author's main point?",
      options: [
        "Electric vehicles cannot reduce urban noise.",
        "Environmental gains must be considered alongside how costs are shared.",
        "Retailers should be exempt from all transport rules.",
      ],
      answer: 1,
      why: "The conclusion acknowledges the quieter street while stressing unresolved distribution of costs.",
      type: "main idea",
    },
    {
      q: "What can reasonably be inferred about shared delivery hubs?",
      options: [
        "Their success would depend partly on cooperation.",
        "They have already solved the problem.",
        "They would eliminate every delivery cost.",
      ],
      answer: 0,
      why: "The text explicitly identifies coordination between competitors as a requirement.",
      type: "inference",
    },
    {
      q: "How does the author treat the council's claim?",
      options: [
        "As a complete assessment of the policy.",
        "As deliberately dishonest.",
        "As a judgement that captures only part of the outcome.",
      ],
      answer: 2,
      why: "Noise improved, but the article adds economic consequences omitted from the success claim.",
      type: "author position",
    },
  ],
};
export const chunks = [
  ["That depends largely on…", "Para introducir una condición relevante."],
  [
    "A possible unintended consequence is…",
    "Para anticipar un efecto no deseado.",
  ],
  ["There is a distinction between…", "Para precisar dos conceptos."],
  [
    "Even if we accept that…, it does not follow that…",
    "Para cuestionar una conclusión sin negar su premisa.",
  ],
  [
    "The strongest argument against this is…",
    "Para formular una objeción real.",
  ],
  ["On balance, I would argue that…", "Para cerrar una postura matizada."],
];
