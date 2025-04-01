"use client";

import React from 'react';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Header: React.FC = () => {
    const { t, i18n } = useTranslation();

    // Definierte Sprachen
    const languages = [
        { code: 'en', name: '🇬🇧 English' },
        { code: 'de', name: '🇩🇪 Deutsch' },
        { code: 'vt', name: '🇻🇳 Tiếng Việt' },
        { code: 'gr', name: '🇬🇷 Ελληνικά' },
        { code: 'jp', name: '🇯🇵 日本語' },
    ];

    // Funktion zum Sprachwechsel
    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <Navbar bg="light" expand="lg" className="w-100">
            <Navbar.Brand href="/">
                <img
                    src="/Logo.png"
                    width="80"
                    height="80"
                    className="d-inline-block align-top me-2"
                    alt="Logo"
                />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                    <NavDropdown
                        title={t('translate')}
                        id="language-dropdown"
                        align="end"
                        drop="down" // explizite Richtung, standardmäßig down
                    >

                    {languages.map((lang) => (
                            <NavDropdown.Item
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                            >
                                {lang.name}
                            </NavDropdown.Item>
                        ))}
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;
