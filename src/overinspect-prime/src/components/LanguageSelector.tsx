import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ flag_layout, userName }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Português', value: 'pt' },
    { label: 'Español', value: 'es' },
  ];

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const onLanguageChange = (e) => {
    setLanguage(e.value);
  };

  return (
    <div className={`language-selector ${flag_layout}`}>
      <Dropdown
        value={language}
        options={languages}
        onChange={onLanguageChange}
        placeholder="Select Language"
        className="language-dropdown"
      />
    </div>
  );
};

export default LanguageSelector;