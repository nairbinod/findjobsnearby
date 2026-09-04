export type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  state: string;
  type: string;
  employmentType: "full_time" | "part_time" | "contract" | "seasonal";
  pay: string;
  category: string;
  postedAt: string;
  expiresAt: string | null;
  description: string;
  responsibilities: string[];
  status: "published" | "closed";
  address: string | null;
  urgent: boolean;
};

function expiresIn30Days(postedAt: string) {
  return new Date(new Date(postedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
}

const demoJobsRaw = [
  {
    id: "demo-oak-ember-line-cook",
    title: "Line Cook",
    company: "Oak & Ember Kitchen",
    city: "Fort Worth",
    state: "TX",
    type: "Full-time",
    employmentType: "full_time" as const,
    pay: "$18-22/hr",
    category: "Food & hospitality",
    postedAt: "2026-09-03T16:00:00.000Z",
    description: "Prepare ingredients, work the line during service, and keep the kitchen organized.",
    responsibilities: ["Prepare ingredients for service", "Work the line during rushes", "Keep the kitchen organized and stocked"],
    address: "412 Magnolia Ave, Fort Worth, TX 76104",
    urgent: true,
  },
  {
    id: "demo-north-star-electrician",
    title: "Residential Electrician",
    company: "North Star Electric",
    city: "Arlington",
    state: "TX",
    type: "Full-time",
    employmentType: "full_time" as const,
    pay: "$28-36/hr",
    category: "Skilled trades",
    postedAt: "2026-09-03T13:00:00.000Z",
    description: "Install, maintain, and repair electrical systems in residential properties.",
    responsibilities: ["Install residential electrical systems", "Diagnose and repair electrical issues", "Follow safety and code requirements"],
    address: null,
    urgent: false,
  },
  {
    id: "demo-patel-caregiver",
    title: "After-school Caregiver",
    company: "The Patel Family",
    city: "Plano",
    state: "TX",
    type: "Part-time",
    employmentType: "part_time" as const,
    pay: "$20-24/hr",
    category: "Care & education",
    postedAt: "2026-09-02T15:00:00.000Z",
    description: "Pick up two children, help with homework, and prepare a simple afternoon snack.",
    responsibilities: ["Pick up two children from school", "Help with homework", "Prepare a simple afternoon snack"],
    address: null,
    urgent: false,
  },
  {
    id: "demo-lone-star-warehouse",
    title: "Warehouse Associate",
    company: "Lone Star Supply Co.",
    city: "Dallas",
    state: "TX",
    type: "Full-time",
    employmentType: "full_time" as const,
    pay: "$19-23/hr",
    category: "Operations",
    postedAt: "2026-09-02T12:00:00.000Z",
    description: "Receive deliveries, pick orders, and keep inventory accurate in a busy warehouse.",
    responsibilities: ["Receive and log incoming deliveries", "Pick and pack orders accurately", "Keep inventory counts up to date"],
    address: null,
    urgent: false,
  },
];

export const jobs: Job[] = demoJobsRaw.map((job) => ({ ...job, expiresAt: expiresIn30Days(job.postedAt), status: "published" as const }));

export const categories = ["All jobs", "Food & hospitality", "Skilled trades", "Care & education", "Operations"];
