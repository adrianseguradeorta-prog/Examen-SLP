import { diagnosticReading, diagnosticWriting } from "./diagnostic-content";
import { listeningTask } from "./listening-content";

export const readingTasks = [
  diagnosticReading,
  {
    version: "training-time-v1",
    title: "Learning that fits the working day",
    text: "A company offered evening courses to all its employees. Attendance was high among office staff but low among workers on rotating shifts. Managers initially assumed that the second group had little interest in training. Interviews suggested a different explanation: shifts were published only a week in advance, while course places had to be booked a month ahead. The company then allowed paid learning time during working hours. Participation increased, although some supervisors complained that covering absent colleagues was difficult. A staff representative welcomed the change but argued that training should not become an extra burden on those who remained at work. The company agreed to review staffing arrangements before expanding the scheme. The experience suggests that offering the same opportunity to everyone does not necessarily make that opportunity equally accessible.",
    questions: [
      {
        type: "main idea",
        question: "What is the main lesson of the experience?",
        options: [
          "Evening courses are always ineffective.",
          "Access depends on working arrangements as well as formal availability.",
          "Workers on rotating shifts do not need training.",
        ],
      },
      {
        type: "supporting detail",
        question: "What made advance booking difficult?",
        options: [
          "Employees did not know their future shifts early enough.",
          "Courses were announced after they had finished.",
          "The company refused to pay course fees.",
        ],
      },
      {
        type: "inference",
        question: "Why will staffing arrangements be reviewed?",
        options: [
          "To prevent employees from taking any courses.",
          "To replace all supervisors.",
          "To avoid transferring the cost of participation to colleagues.",
        ],
      },
      {
        type: "author position",
        question:
          "How does the writer treat the initial explanation for low attendance?",
        options: [
          "As a fact confirmed by the interviews.",
          "As an assumption challenged by further evidence.",
          "As a deliberate attempt to mislead workers.",
        ],
      },
    ],
  },
  {
    version: "repair-cafe-v1",
    title: "More than a repaired kettle",
    text: "A neighbourhood repair café began as a way to keep small appliances out of the rubbish. Volunteers repaired dozens of items in its first month, and the organisers used this figure to attract funding. Later, they noticed that some visitors returned with no broken objects. They came to learn practical skills or simply to meet people. The café introduced short workshops, which meant fewer repairs could be completed each afternoon. One funder questioned the fall in the number of repaired items. The organisers replied that counting objects alone missed the confidence people gained by learning to make simple repairs themselves. They did not claim that every workshop prevented waste; they proposed following up with participants to find out what happened afterwards. Their challenge is to describe these wider benefits without treating every pleasant conversation as proof of environmental impact.",
    questions: [
      {
        type: "main idea",
        question: "What challenge does the café face?",
        options: [
          "Showing wider benefits without making unsupported claims.",
          "Repairing only expensive appliances.",
          "Preventing visitors from learning new skills.",
        ],
      },
      {
        type: "supporting detail",
        question: "Why did repair totals fall?",
        options: [
          "Volunteers stopped attending.",
          "Fewer people lived in the neighbourhood.",
          "Some time was reassigned to workshops.",
        ],
      },
      {
        type: "inference",
        question: "What would follow-up with participants help establish?",
        options: [
          "Whether all funders agree with each other.",
          "Whether learning at the café led to later practical changes.",
          "Whether conversation should be banned.",
        ],
      },
      {
        type: "implied meaning",
        question: "What does the last sentence suggest about evidence?",
        options: [
          "Enjoyment is enough to prove reduced waste.",
          "Benefits that are hard to count cannot exist.",
          "Positive experiences and demonstrated environmental effects are different claims.",
        ],
      },
    ],
  },
];
export const listeningTasks = [
  listeningTask,
  {
    version: "energy-meeting-v1",
    title: "Savings that need explaining",
    audio: "/audio/energy-meeting-v1.mp3",
    questions: [
      {
        type: "main idea",
        question: "What is the speaker mainly explaining?",
        options: [
          "Why the centre will close permanently.",
          "Why lower energy bills need careful interpretation.",
          "Why weather has no effect on heating.",
        ],
      },
      {
        type: "supporting detail",
        question: "What change was made to the heating schedule?",
        options: [
          "Heating started later in the morning.",
          "Heating was removed from every room.",
          "The building stayed heated all night.",
        ],
      },
      {
        type: "inference",
        question: "Why is the comparison with last winter uncertain?",
        options: [
          "The centre did not exist then.",
          "No bills were kept.",
          "Milder weather may explain part of the saving.",
        ],
      },
      {
        type: "speaker position",
        question: "How does the speaker respond to the volunteers?",
        options: [
          "Their discomfort is irrelevant.",
          "Their experience should influence the next adjustment.",
          "They should stop opening the building.",
        ],
      },
      {
        type: "inference",
        question: "What would count as a better basis for the next decision?",
        options: [
          "Energy use considered alongside conditions inside the building.",
          "The cheapest bill alone.",
          "A promise that nobody will complain again.",
        ],
      },
    ],
  },
  {
    version: "mentoring-v1",
    title: "Making room for questions",
    audio: "/audio/mentoring-v1.mp3",
    questions: [
      {
        type: "main idea",
        question: "Why is the induction programme changing?",
        options: [
          "To remove all written guidance.",
          "To test employees without warning.",
          "To help new colleagues ask questions that written guidance alone may not resolve.",
        ],
      },
      {
        type: "supporting detail",
        question: "What will happen during the first month?",
        options: [
          "New colleagues will work alone every day.",
          "Each newcomer will have two short meetings a week with a mentor.",
          "All meetings will be held after working hours.",
        ],
      },
      {
        type: "inference",
        question: "Why will newcomers choose some of the meeting topics?",
        options: [
          "Their difficulties may differ from what managers expect.",
          "Mentors know nothing about the job.",
          "The handbook contains no useful information.",
        ],
      },
      {
        type: "speaker position",
        question: "What is the speaker’s attitude to asking for help?",
        options: [
          "It should affect promotion decisions immediately.",
          "It proves that recruitment has failed.",
          "It should be possible without feeling embarrassed.",
        ],
      },
      {
        type: "inference",
        question: "Why are mentors asked to report themes rather than names?",
        options: [
          "To avoid learning anything from the programme.",
          "To improve guidance while protecting confidence in the conversations.",
          "To prevent employees from meeting again.",
        ],
      },
    ],
  },
];
export const writingTasks = [
  diagnosticWriting,
  {
    version: "learning-budget-v1",
    title: "Who should receive training first?",
    prompt:
      "Your organisation can fund training for only part of its staff this year. Write a proposal explaining how places should be allocated fairly, what the organisation could gain, and how colleagues who are not selected could still benefit. Address a reasonable objection to your proposal.",
  },
  {
    version: "shared-energy-v1",
    title: "A shared energy decision",
    prompt:
      "A community centre wants to reduce energy use. Write a recommendation comparing changes to opening hours with investment in better insulation. Consider access for different users, short-term costs and longer-term benefits. Explain what information you would need before making a final decision.",
  },
];
export type TaskSkill = "reading" | "listening" | "writing" | "speaking";
export function comprehensionTask(
  skill: "reading" | "listening",
  version: string,
) {
  return (skill === "reading" ? readingTasks : listeningTasks).find(
    (t) => t.version === version,
  );
}
