"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EstadoAuth = { erro?: string; mensagem?: string } | undefined;

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function traduzErroSupabase(mensagem: string) {
  if (mensagem.includes("already registered") || mensagem.includes("already been registered")) {
    return "Este e-mail já está cadastrado.";
  }
  if (mensagem.includes("Password should be")) {
    return "A senha não atende aos requisitos mínimos (mínimo 8 caracteres).";
  }
  if (mensagem.includes("Invalid login credentials")) {
    return "E-mail ou senha inválidos.";
  }
  if (mensagem.includes("Email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.";
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

export async function entrar(
  _estado: EstadoAuth,
  formData: FormData
): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "") || "/dashboard";

  if (!email || !senha) {
    return { erro: "Preencha e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    return { erro: traduzErroSupabase(error.message) };
  }

  redirect(redirectTo);
}

export async function cadastrar(
  _estado: EstadoAuth,
  formData: FormData
): Promise<EstadoAuth> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (!nome || !email || !senha) {
    return { erro: "Preencha todos os campos." };
  }
  if (senha.length < 8) {
    return { erro: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (senha !== confirmarSenha) {
    return { erro: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { display_name: nome },
      emailRedirectTo: `${siteUrl()}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    return { erro: traduzErroSupabase(error.message) };
  }

  return {
    mensagem:
      "Cadastro realizado! Confira seu e-mail para confirmar a conta antes de entrar.",
  };
}

export async function recuperarSenha(
  _estado: EstadoAuth,
  formData: FormData
): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { erro: "Informe seu e-mail." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/auth/confirm?next=/redefinir-senha`,
  });

  if (error) {
    return { erro: "Não foi possível enviar o e-mail de recuperação." };
  }

  return {
    mensagem: "Se esse e-mail estiver cadastrado, você receberá um link de recuperação.",
  };
}

export async function redefinirSenha(
  _estado: EstadoAuth,
  formData: FormData
): Promise<EstadoAuth> {
  const senha = String(formData.get("senha") ?? "");
  const confirmarSenha = String(formData.get("confirmarSenha") ?? "");

  if (senha.length < 8) {
    return { erro: "A senha deve ter pelo menos 8 caracteres." };
  }
  if (senha !== confirmarSenha) {
    return { erro: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    return {
      erro: "Não foi possível redefinir a senha. Solicite um novo link de recuperação.",
    };
  }

  redirect("/login?mensagem=senha-redefinida");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function entrarComGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${siteUrl()}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?erro=login-google-falhou");
  }

  redirect(data.url);
}
