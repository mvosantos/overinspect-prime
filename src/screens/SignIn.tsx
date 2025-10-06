import { useAuth } from '../contexts/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { Toast } from 'primereact/toast';
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";

interface SignInProps {
  theme: string;
  setTheme: (theme: string) => void;
}

import { useRef } from 'react';

export default function SignIn({ theme, setTheme }: SignInProps) {
  const { t } = useTranslation("translation");

  const navigate = useNavigate();
  const { login, authError } = useAuth();
  const toast = useRef<Toast>(null);

  // Schema de validação com Zod
  const schema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
    password: z.string().min(4, { message: "A senha deve ter pelo menos 4 caracteres" }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });


  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await login(data.email, data.password);
    },
    onSuccess: () => {
      navigate('/home');
      console.log('Login bem-sucedido');
    },
    onError: () => {
      toast.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Login/Senha errado(s)',
        life: 3000,
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const cardHeaderTemplate = (
    <div className="p-4">
      <h2 className="text-2xl font-bold tracking-tighter">
        {t("signin:enter_with_your_account")}
      </h2>
      <p className="text-sm mt-1">{t("signin:use_your_email")}</p>
    </div>
  );

  return (
    <main className="h-screen flex flex-col md:flex-row w-full transition-colors">
      <Toast ref={toast} position="bottom-right" />
      {/* Imagem de Fundo */}
      <div
        id="divBg"
        style={{
          backgroundImage: "url('/img/login_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="hidden md:flex md:flex-1 h-full md:p-16"
      ></div>

      {/* Seção de Login */}
      <section className="flex flex-col items-center justify-center h-full w-full max-w-none p-4 md:p-4 md:flex-none md:w-[680px] relative">
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src="/img/mainlogo.png"
            alt="Logo OverInspect"
            className="h-32 md:h-48 mx-auto drop-shadow-[0_0_6px_white]"
          />
        </div>

        {/* Card do PrimeReact */}
        <Card
          title={cardHeaderTemplate}
          className="w-full max-w-md shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Campo de Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  {t("common:email")}
                </label>
                <InputText
                  id="email"
                  placeholder="exemplo@email.com"
                  type="email"
                  className={`w-full p-inputtext-sm ${errors.email ? "p-invalid" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-xs text-red-500">{errors.email.message}</span>
                )}
                {authError && (
                  <span className="text-xs text-red-500 block mt-2">{authError}</span>
                )}
              </div>
              {/* Campo de Senha */}
              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  {t("common:password")}
                </label>
                <InputText
                  id="password"
                  placeholder="**************"
                  type="password"
                  className={`w-full p-inputtext-sm ${errors.password ? "p-invalid" : ""}`}
                  {...register("password")}
                />
                {errors.password && (
                  <span className="text-xs text-red-500">{errors.password.message}</span>
                )}
              </div>
              {/* Link de Esqueci a Senha */}
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm hover:underline">
                  {t("signin:forget_password")}
                </Link>
              </div>
              {/* Botão de Login */}
              <div className="mt-6">
                <Button
                  label={mutation.status === 'pending' ? `${t("common:loading")}...` : t("common:enter")}
                  icon={mutation.status === 'pending' ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
                  type="submit"
                  disabled={mutation.status === 'pending'}
                  className={`w-full ${mutation.status === 'pending' ? "p-button-secondary" : "p-button-primary"}`}
                />
              </div>
            </form>
            {/* Separador OU */}
            <Divider align="center" className="mt-6 mb-4">
              <span className="text-sm px-3">{t("common:orUCase")}</span>
            </Divider>
            {/* Botão de Cadastre-se */}
            <Button
              label={t("signin:signup")}
              icon="pi pi-user-plus"
              severity="secondary"
              outlined
              className="w-full"
              onClick={() => console.log("Navegar para cadastro")}
            />
          </div>
          {/* Footer */}
          <div className="flex items-center justify-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
            <p className="text-center text-xs">
              {t("signin:check_use_policy")}
            </p>
          </div>
        </Card>
        {/* Seletor de Idioma */}
        <div className="mt-4 md:mt-8 flex items-center justify-evenly w-full max-w-md">
          <LanguageSelector
            flag_layout="side-by-side"
            userName={t("common:select_language")}
          />
          {/* Botão de alternância de tema */}
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </section>
      {/* <Toaster position="bottom-right" className="text-green-600" /> */}
    </main>
  );
}
