import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem"; // Importação type-only
import { languages } from "../config/language";

interface LanguageSelectorProps {
  userName?: string;
  flag_layout: 'dropdown' | 'side-by-side'
}

export default function LanguageSelector({ userName, flag_layout }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation("translation"); 
  
  const menu = useRef<Menu>(null); 

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Definição dos itens do Menu
  const menuItems: MenuItem[] = languages.map((lang) => ({
    label: lang.name,
    template: () => (
      <div 
        className="flex items-center gap-2 p-menuitem-link cursor-pointer" 
        onClick={() => handleLanguageChange(lang.code)}
      >
        <img src={lang.flag_sm} alt={`Bandeira de ${lang.name}`} className="w-5 h-auto" />
        <span>{lang.name}</span>
      </div>
    )
  }));


  return (
    <>
      {flag_layout === 'dropdown' ? (
        <>
            <Menu model={menuItems} popup ref={menu} id="language_menu" />
            
            {/* NOVO GATILHO (DIV) para contornar o erro do Button template */}
            <div
                className="p-3 text-lg font-medium hover:bg-gray-200 cursor-pointer transition-colors flex items-center gap-2 rounded-lg"
                onClick={(event) => menu.current?.toggle(event)}
                aria-controls="language_menu"
                aria-haspopup
            >
                <img
                    src={currentLanguage.flag_sm}
                    alt={`Bandeira de ${currentLanguage.name}`}
                    className="w-5 h-auto"
                />
                <span className="text-sm truncate font-medium text-gray-700">{userName || t('email_label')}</span> 
            </div>
        </>
      )
      :
      (
        <div className="flex flex-row m-4 gap-2 cursor-pointer">
          {languages.map((lang) => (
            <img 
              key={lang.code}
              src={lang.flag_md} 
              alt={`Bandeira de ${lang.name}`} 
              className={`h-auto rounded-4xl w-8 transition-opacity ${lang.code === i18n.language ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              onClick={() => handleLanguageChange(lang.code)} 
            />
          ))}
        </div>
      )}
    </>
  );
}