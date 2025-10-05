
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

export default function ForgotPassword() {

    const { t } = useTranslation(["common", "parameters"]);
    return (
        <main className="h-screen flex w-full">

            <div
                id="divBg"
                style={{
                    backgroundImage: "url('/img/login_bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
                className="w-full h-full flex p-16"
            ></div>
            <section className="flex flex-col items-center justify-center bg-background h-full max-w-3xl w-full p-4">
                <div className="text-center mb-4">
                    <img
                        src="/img/mainlogo.png"
                        alt="Logo OverInspect"
                        className="h-45 content-center mx-auto"
                    />
                </div>

                <Card className="w-full max-w-md">
                    <div className="p-4">
                        <div className="text-2xl font-bold tracking-tighter mb-2">
                            {t("signin:forget_password")}
                        </div>
                        <div className="mb-4 text-muted-foreground">
                            {t("signin:start_password_recover_msg")}
                        </div>
                        <form onSubmit={() => {}} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="email" className="text-sm font-medium mb-1">{t("common:email")}</label>
                                <InputText id="email" placeholder="exemplo@email.com" type="email" value="" className="w-full" />
                            </div>
                            <Button label={t("common:enter")}                            
                                type="submit"
                                className="w-full" />
                        </form>
                        <div className="mt-1 text-right">
                            <a href="/" className="text-sm text-muted-foreground hover:underline">
                                {t("signin:back_to_signin_page")}
                            </a>
                        </div>
                        <div className="flex items-center justify-center mt-4">
                            <p className="text-muted-foreground text-center text-xs">
                                {t("signin:check_use_policy")}
                            </p>
                        </div>
                    </div>
                </Card>
                <div className="mt-4 md:mt-8">
                    <LanguageSelector flag_layout="side-by-side" />
                </div>
            </section>
        </main>
    );
}