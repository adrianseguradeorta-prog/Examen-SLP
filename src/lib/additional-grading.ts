// Server only: answer keys and listening scripts never imported into client components.
export const additionalGrading: Record<
  string,
  { keys: number[]; explanations: string[]; transcript?: string }
> = {
  "training-time-v1": {
    keys: [1, 0, 2, 1],
    explanations: [
      "Identical access on paper did not address the different working schedules.",
      "Shifts were known only a week ahead; courses required booking a month ahead.",
      "The representative worries about colleagues who cover those attending courses.",
      "Interviews revealed a scheduling barrier rather than confirming a lack of interest.",
    ],
  },
  "repair-cafe-v1": {
    keys: [0, 2, 1, 2],
    explanations: [
      "The café wants to recognise learning and social benefits without overstating environmental effects.",
      "Workshops used time that had previously been available for repairs.",
      "Following up could show whether participants later used their new skills.",
      "A positive conversation is not by itself evidence of less waste.",
    ],
  },
  "energy-meeting-v1": {
    keys: [1, 0, 2, 1, 0],
    explanations: [
      "The speaker discusses both the saving and the reasons it needs interpretation.",
      "The announcement says the heating now starts an hour later.",
      "The weather was milder, so the schedule cannot be assumed to explain the whole reduction.",
      "The speaker proposes warming the entrance earlier in response to volunteers’ experience.",
      "The next review will combine meter readings with notes on how the rooms feel.",
    ],
    transcript:
      "At our last meeting, we agreed to reduce energy use at the community centre. The heating now starts an hour later, and this month’s bill is lower than the bill for the same month last year. That sounds encouraging, but the weather has also been milder, so we cannot give the new schedule all the credit. Two volunteers have told us that the entrance is cold when they arrive to prepare the rooms. We should not dismiss that simply because the bill has fallen. From Monday, we will warm the entrance earlier while keeping the later start in rooms that nobody uses until lunchtime. Please keep a short note of any uncomfortable conditions, alongside the weekly meter reading. In four weeks, we will look at both kinds of information before deciding whether to keep the change.",
  },
  "mentoring-v1": {
    keys: [2, 1, 0, 2, 1],
    explanations: [
      "The handbook remains useful, but newcomers need space to ask questions.",
      "Two short mentor meetings each week are planned for the first month.",
      "Letting newcomers choose topics avoids assuming everyone faces the same problems.",
      "The speaker wants questions to be asked without embarrassment.",
      "Themes can improve the handbook without identifying people who asked for help.",
    ],
    transcript:
      "Before our new colleagues arrive, I want to explain a change to their induction. We will still give everyone the handbook, but a document cannot anticipate every question. During the first month, each newcomer will have two short meetings a week with an experienced colleague. These will take place during working hours. The mentor will suggest some topics, but the newcomer should choose others. The things that seem obvious to us may be the very things they find confusing. Please make it clear that asking for help is expected, not embarrassing. At the end of the month, mentors will report common themes to the training team, without naming the people who raised them. That should help us improve the handbook while keeping these conversations useful and open. We will ask both newcomers and mentors whether the meetings were worth the time.",
  },
};
