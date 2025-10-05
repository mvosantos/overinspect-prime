// src/pages/SignIn.tsx 

import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

import { Button } from "primereact/button";
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import LanguageSelector from "../components/LanguageSelector";

interface SignInProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export default function SignIn({ theme, setTheme }: SignInProps) {
    const { t } = useTranslation("translation");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
             setIsLoading(false);
             console.log("Tentativa de login com:", email, password);
        }, 1500);
    };

    const cardHeaderTemplate = (
        <div className="p-4"> 
            <h2 className="text-2xl font-bold tracking-tighter">
                {t("signin:enter_with_your_account")}
            </h2>
            <p className="text-sm mt-1">
                {t("signin:use_your_email")}
            </p>
        </div>
    );

    return (
        <main className="h-screen flex flex-col md:flex-row w-full transition-colors">
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
                {/* Botão de alternância de tema */}
                <button
                  type="button"
                  className="absolute top-4 right-4 p-2 rounded bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Alternar tema"
                >
                  {theme === "dark" ? "🌞" : "🌙"}
                </button>

                {/* Logo */}
                <div className="text-center mb-4">
                    <img
                        src="/img/mainlogo.png"
                        alt="Logo OverInspect"
                        className="h-32 md:h-48 mx-auto"
                    />
                </div>

                {/* Card do PrimeReact */}
                <Card 
                    title={cardHeaderTemplate}
                    className="w-full max-w-md shadow-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <div className="p-card-content"> 
                        <form onSubmit={handleSubmit}>
                            {/* Campo de Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    {t("common:email")}
                                </label>
                                <InputText 
                                    id="email" 
                                    placeholder="exemplo@email.com" 
                                    type="email" 
                                    className="w-full p-inputtext-sm"
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>
                            {/* Campo de Senha */}
                            <div className="mt-4">
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    {t("common:password")}
                                </label>
                                <InputText 
                                    id="password" 
                                    placeholder="**************" 
                                    type="password" 
                                    className="w-full p-inputtext-sm"
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>
                            {/* Link de Esqueci a Senha */}
                            <div className="mt-2 text-right">
                                <a href="/forgot-password" className="text-sm hover:underline">
                                    {t("signin:forget_password")}
                                </a>
                            </div>
                            {/* Botão de Login */}
                            <div className="mt-6"> 
                                <Button 
                                    label={isLoading ? `${t("common:loading")}...` : t("common:enter")}
                                    icon={isLoading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
                                    type="submit" 
                                    disabled={isLoading}
                                    className={`w-full ${isLoading ? 'p-button-secondary' : 'p-button-primary'}`} 
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
                            onClick={() => console.log('Navegar para cadastro')}
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
                <div className="mt-4 md:mt-8"> 
                    <LanguageSelector flag_layout="side-by-side" userName={t("common:select_language")} />
                </div>
            </section>
            {/* <Toaster position="bottom-right" className="text-green-600" /> */}
        </main>
    );
}