// Public tasks only. Answer keys live in diagnostic-grading.ts (server imports).
export const diagnosticReading = {
  version: "sensors-v1",
  title: "Warnings are only the beginning",
  text: "A coastal town installed flood sensors after a severe storm. The new system could detect rising water earlier than the previous network, but its first alert reached many residents in technical language they did not understand. Others received no message because their contact details were outdated. The engineering team proposed adding more sensors. Community groups instead asked the council to rehearse evacuation procedures and offer alerts in several languages. Neither proposal was inherently incompatible with the other. Yet the council's limited budget meant that funding additional equipment would delay public training. An independent review concluded that earlier detection was valuable only if people could interpret the warning and act on it. The review did not recommend abandoning technology; it questioned whether technical improvements alone should define success.",
  questions: [
    {
      question: "Which statement best captures the review's position?",
      type: "main idea",
      options: [
        "Technology is useful when supported by effective communication and action.",
        "Flood sensors should be removed.",
        "More equipment will automatically make everyone safer.",
      ],
    },
    {
      question: "What can be inferred about the two proposals?",
      type: "inference",
      options: [
        "They require residents to stop using technology.",
        "They could complement each other, despite competing for funds.",
        "The review found both proposals equally ineffective.",
      ],
    },
    {
      question: "Why does the author mention outdated contact details?",
      type: "supporting detail",
      options: [
        "To establish that residents deliberately ignored alerts.",
        "To show the sensors measured the wrong water level.",
        "To illustrate a weakness beyond the detection equipment itself.",
      ],
    },
    {
      question: "What does 'success' imply in the final sentence?",
      type: "implied meaning",
      options: [
        "Purchasing the largest possible number of sensors.",
        "Helping people respond effectively, as well as detecting danger.",
        "Eliminating the need for public training.",
      ],
    },
  ],
};
export const diagnosticWriting = {
  version: "public-services-v1",
  title: "Technology and access to public services",
  prompt:
    "A local authority plans to move most public services online. Write a recommendation explaining the benefits, the risks for people with limited digital access, and how the authority should respond. Address a reasonable objection to your recommendation.",
};
