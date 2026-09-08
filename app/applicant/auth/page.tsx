import RoleAuthForm from "@/components/RoleAuthForm";

export default function ApplicantAuthPage() {
  return (
    <RoleAuthForm
      role="candidate"
      eyebrow="Your local work profile"
      headline={<>Start where<br />you are.</>}
      subhead="One simple account for finding work and building a profile that sounds like you."
      otherRoleHref="/employer/auth"
      otherRoleLabel="Hiring instead? Sign in as an employer"
    />
  );
}
