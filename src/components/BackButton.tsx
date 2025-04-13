'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import styles from './BackButton.module.css';

export default function BackButton() {
    const router = useRouter();

    return (
        <motion.button
            onClick={() => router.back()}
            whileHover={{ x: -5, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 250 }}
            className={styles.backButton}
            aria-label="Zurück"
        >
            <ChevronLeftIcon className={styles.icon} />
        </motion.button>
    );
}
