"use client";

import React, { useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    isXmlUploaded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isXmlUploaded }) => {
    const [showSetupItems, setShowSetupItems] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();

    // Liste der Unterpunkte
    const subItems = [
        t("Eingabeliste"),
        t("Disposition"),
        t("Kapazitätsplan"),
        t("Kaufteildisposition"),
        t("Losgrößen"),
        t("Export"),
    ];

    const handleSetupClick = () => {
        router.push("/input");
        // Falls XML bereits hochgeladen wurde, können zusätzlich die Unterpunkte getoggelt werden:
        if (isXmlUploaded) {
            setShowSetupItems((prev) => !prev);
        }
    };

    return (
        <div className={styles.sidebar}>
            <ListGroup className={styles.listGroup}>
                {/* Haupt-Eintrag Setup */}
                <ListGroup.Item
                    action
                    onClick={handleSetupClick}
                    className={`${styles.mainItem} ${!isXmlUploaded ? styles.disabled : ""}`}
                >
                    {t("nav.setup")}
                </ListGroup.Item>

                {/* Unterpunkte: werden nur angezeigt, wenn XML hochgeladen wurde */}
                {showSetupItems && isXmlUploaded && (
                    <>
                        {subItems.map((item, index) => (
                            <ListGroup.Item key={index} action className={styles.subItem}>
                                {item}
                            </ListGroup.Item>
                        ))}
                    </>
                )}

                {/* Hinweis, falls keine XML hochgeladen wurde */}
                {!isXmlUploaded && (
                    <ListGroup.Item className={styles.infoItem}>
                    </ListGroup.Item>
                )}
            </ListGroup>
        </div>
    );
};

export default Sidebar;
