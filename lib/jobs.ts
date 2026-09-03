export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  pay: string;
  category: string;
  posted: string;
  description: string;
};

export const jobs: Job[] = [
  {
    id: "oak-ember-line-cook",
    title: "Line Cook",
    company: "Oak & Ember Kitchen",
    location: "Fort Worth, TX",
    type: "Full-time",
    pay: "$18-22/hr",
    category: "Food & hospitality",
    posted: "2h ago",
    description: "Prepare ingredients, work the line during service, and keep the kitchen organized.",
  },
  {
    id: "north-star-electrician",
    title: "Residential Electrician",
    company: "North Star Electric",
    location: "Arlington, TX",
    type: "Full-time",
    pay: "$28-36/hr",
    category: "Skilled trades",
    posted: "5h ago",
    description: "Install, maintain, and repair electrical systems in residential properties.",
  },
  {
    id: "patel-caregiver",
    title: "After-school Caregiver",
    company: "The Patel Family",
    location: "Plano, TX",
    type: "Part-time",
    pay: "$20-24/hr",
    category: "Care & education",
    posted: "Yesterday",
    description: "Pick up two children, help with homework, and prepare a simple afternoon snack.",
  },
  {
    id: "lone-star-warehouse",
    title: "Warehouse Associate",
    company: "Lone Star Supply Co.",
    location: "Dallas, TX",
    type: "Full-time",
    pay: "$19-23/hr",
    category: "Operations",
    posted: "Yesterday",
    description: "Receive deliveries, pick orders, and keep inventory accurate in a busy warehouse.",
  },
];

export const categories = ["All jobs", "Food & hospitality", "Skilled trades", "Care & education", "Operations"];
