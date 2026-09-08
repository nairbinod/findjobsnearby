import RoleAuthForm from "@/components/RoleAuthForm";

export default function EmployerAuthPage() {
  return (
    <RoleAuthForm
      role="employer"
      eyebrow="Hire locally"
      headline={<>Start hiring<br />today.</>}
      subhead="One simple account for posting roles and managing applicants from nearby small businesses."
      otherRoleHref="/applicant/auth"
      otherRoleLabel="Looking for work instead? Sign in as a job seeker"
    />
  );
}
