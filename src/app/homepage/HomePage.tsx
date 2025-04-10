"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

const HomePage: React.FC = () => {
    const router = useRouter();

    const handleClick = () => {
        router.push("/setup");
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>
                    Willkommen bei <span className={styles.highlight}>The Four</span>
                </h1>
                <p className={styles.subtitle}>
                    Deine Plattform für intelligente Produktionsplanung.<br />
                    Starte jetzt mit dem Setup.
                </p>
                <button onClick={handleClick} className={styles.setupButton}>
                    Setup starten
                </button>
            </div>
        </div>
    );
};

export default HomePage;
