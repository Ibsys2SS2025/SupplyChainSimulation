"use client";

import React from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import '../language/i18n';
import { MdLanguage } from "react-icons/md";
import styles from "./Header.module.css";

const Header: React.FC = () => {
    const { t, i18n } = useTranslation();

    const languages = [
        { code: "en", name: "🇬🇧 English" },
        { code: "de", name: "🇩🇪 Deutsch" },
        { code: "es", name: "🇪🇸 Español" },
        { code: "jp", name: "🇯🇵 日本語" },
        { code: "zh", name: "🇨🇳 中文 (Mandarin)" },
    ];

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <Navbar expand="lg" className={styles.navbar}>
            {/* Hier fluid + px-0 */}
            <Container fluid className="px-0">
                <Navbar.Brand href="/" className={styles.brand}>
                    <img
                        src="/Logo.png"
                        width="80"
                        height="80"
                        className={styles.logo}
                        alt="Logo"
                    />
                </Navbar.Brand>

                <Navbar.Toggle
                    aria-controls="basic-navbar-nav"
                    className={styles.navbarToggle}
                />

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <NavDropdown
                            title={
                                <span className={styles.iconWrapper}>
                                    <MdLanguage className={styles.icon} />
                                </span>
                            }
                            id="language-dropdown"
                            align="end"
                            drop="down"
                            menuVariant="light"
                            className={`${styles.navDropdown} ${styles.noCaret}`}
                        >
                            {languages.map((lang) => (
                                <NavDropdown.Item
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={styles.dropdownItem}
                                >
                                    {lang.name}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
