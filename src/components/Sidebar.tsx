"use client";

import React, { useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import styles from "./Sidebar.module.css";

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const [showSidebar, setShowSidebar] = useState(false);

    // Navigationseinträge mit Pfad
    const navItems = [
        { label: t("nav.input"), path: "/prognose" },
        { label: t("nav.disposition"), path: "/disposition" },
        { label: t("nav.capacityplan"), path: "/kapazitaetsplan" },
        { label: t("nav.orders"), path: "/kaufteildisposition" },
        { label: t("nav.inputfinal"), path: "/eingabetabelle" },
        { label: t("nav.export"), path: "/export" },
    ];

    return (
        <div className={styles.sidebarWrapper}>
            {/* Handle zum Öffnen */}
            <div
                className={styles.sidebarHandle}
                onMouseEnter={() => setShowSidebar(true)}
                onClick={() => setShowSidebar((prev) => !prev)}
            />
            {/* Sidebar selbst */}
            <div
                className={`${styles.sidebar} ${showSidebar ? styles.visible : ""}`}
                onMouseLeave={() => setShowSidebar(false)}
            >
                <ListGroup className={styles.listGroup}>
                    <ListGroup.Item className={styles.mainItem}>
                        {t("nav.setup")}
                    </ListGroup.Item>
                    {navItems.map(({ label, path }, index) => (
                        <Link href={path} key={index} passHref>
                            <ListGroup.Item className={styles.subItem}>
                                {label}
                            </ListGroup.Item>
                        </Link>
                    ))}
                </ListGroup>
            </div>
        </div>
    );
};

export default Sidebar;
