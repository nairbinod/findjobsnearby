import { createClient } from "@supabase/supabase-js";

const [employerId, title, companyName, city, payRange, employmentType, responsibilitiesText] = process.argv.slice(2);
const responsibilities = (responsibilitiesText ?? "").split("|").map((item) => item.trim()).filter(Boolean);

if (!employerId || !title || !companyName || !city || !payRange || !employmentType || responsibilities.length < 3 || responsibilities.length > 5) {
  console.error("Usage: npm run create:job -- <employer-id> <title> <company> <city> <pay-range> <full_time|part_time|contract|seasonal> <responsibility 1|responsibility 2|responsibility 3>");
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local environment first.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const { error } = await supabase.from("jobs").insert({
  employer_id: employerId,
  title,
  company_name: companyName,
  city,
  state: "TX",
  pay_range: payRange,
  employment_type: employmentType,
  responsibilities,
  description: responsibilities.join(" "),
  status: "published",
  ai_assisted: false,
  approved_at: new Date().toISOString(),
});

if (error) {
  console.error(`Could not create job: ${error.message}`);
  process.exit(1);
}

console.log(`Published ${title} for ${companyName}.`);
