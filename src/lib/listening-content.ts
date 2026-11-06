// Original project task. Answer keys and transcript are returned only after submission.
export const listeningTask = {
  version: "library-evenings-v1" as const,
  title: "A trial worth changing",
  audio: "/audio/library-evenings-v1.mp3",
  questions: [
    {
      type: "main idea",
      question: "Why is the library changing its evening trial?",
      options: [
        "To respond to different patterns of use while keeping evening access.",
        "To remove all services for students.",
        "To prove that residents dislike the library.",
      ],
    },
    {
      type: "supporting detail",
      question: "Which evening will still have a staffed desk?",
      options: ["Tuesday.", "Thursday.", "Saturday."],
    },
    {
      type: "inference",
      question: "What does the popularity of study spaces suggest?",
      options: [
        "Visitors have stopped reading entirely.",
        "Evening opening is useful only when every service is busy.",
        "The value of evening access cannot be measured only by desk transactions.",
      ],
    },
    {
      type: "inference",
      question:
        "What would the manager probably do if the revised arrangement excluded some users?",
      options: [
        "Keep it unchanged because the decision is permanent.",
        "Use the feedback to reconsider the arrangement.",
        "Stop asking users for feedback.",
      ],
    },
    {
      type: "speaker position",
      question: "How does the manager view the trial?",
      options: [
        "As a complete failure that must end immediately.",
        "As proof that staffing is unnecessary.",
        "As a useful experiment that needs adjustment and review.",
      ],
    },
  ],
};
