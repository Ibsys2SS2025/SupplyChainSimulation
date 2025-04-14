"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";
import { useTranslation } from "react-i18next";


const HomePage: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const handleClick = () => {
        router.push("/setup");
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>
                    {t("homepage.title")} <span className={styles.highlight}>The Four</span>
                </h1>
                <p className={styles.subtitle}>
                    {t("homepage.description")}<br />
                    {t("homepage.description2")}
                </p>
                <button onClick={handleClick} className={styles.setupButton}>
                    {t("homepage.buttonSetup")}
                </button>
            </div>
        </div>
    );
};

export default HomePage;
