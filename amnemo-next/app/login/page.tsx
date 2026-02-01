import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Amnemo</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gestion de parc informatique
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
