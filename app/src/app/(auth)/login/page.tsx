import { LoginForm } from "@/components/auth/login-form";

const MENSAGENS: Record<string, string> = {
  "senha-redefinida": "Senha redefinida com sucesso. Entre com sua nova senha.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; mensagem?: string }>;
}) {
  const { redirectTo, mensagem } = await searchParams;

  return (
    <LoginForm
      redirectTo={redirectTo}
      mensagemInicial={mensagem ? MENSAGENS[mensagem] : undefined}
    />
  );
}
