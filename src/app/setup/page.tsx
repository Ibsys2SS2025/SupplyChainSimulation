'use client';

import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { parseStringPromise } from 'xml2js';
import styles from './page.module.css';
import { useTranslation } from 'react-i18next';
import BackButton from '@/components/BackButton';

// Importiere den Context
import { useXmlData } from '@/context/XmlDataContext';

const InputPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    // Hier kommt der globale Zustand:
    const { xmlData, setXmlData } = useXmlData();

    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mappingError, setMappingError] = useState<boolean>(false);
    const [dataInitialized, setDataInitialized] = useState<boolean>(false);

    // XML → JSON
    const convertXmlToJson = async (xml: string) => {
        try {
            const result = await parseStringPromise(xml, { explicitArray: false });
            setXmlData(result);
            console.log('XML zu JSON konvertiert:', result);
            setMappingError(false);
        } catch (err) {
            setMappingError(true);
            console.error('XML Parse Fehler:', err);
        }
    };

    // Datei auswählen
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                convertXmlToJson(content);
            };
            reader.readAsText(selectedFile);
        }
    };

    // Datenverarbeitung (simuliert)
    const mapXmlData = async () => {
        setIsLoading(true);
        setMappingError(false);
        try {
            console.log('Mapping Data aus dem Kontext:', xmlData);
            // Warte 1.5 Sekunden (Sim)
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setDataInitialized(true);
        } catch (error) {
            setMappingError(true);
            console.error('Mapping Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <BackButton />

            <h2 className={styles.title}>{t('setup.title')}</h2>
            <p className={styles.description}>{t('setup.description')}</p>

            <Form className={styles.form}>
                <Form.Group controlId="xmlUpload" className="mb-3">
                    <Form.Control
                        type="file"
                        accept=".xml"
                        onChange={handleFileChange}
                    />
                </Form.Group>

                {mappingError && (
                    <Alert variant="danger">{t('setup.xmlAlertDanger')}</Alert>
                )}
                {dataInitialized && (
                    <Alert variant="success">{t('setup.xmlAlertSuccess')}</Alert>
                )}

                <div className={styles.button}>
                    <Button
                        variant="outline-info"
                        onClick={mapXmlData}
                        disabled={!file || isLoading}
                    >
                        {isLoading && <Spinner size="sm" className="me-2" />}
                        {t('setup.loadDataButton')}
                    </Button>
                </div>
            </Form>

            {dataInitialized && (
                <div className={styles.nextSteps}>
                    <h2>{t('setup.titleNextSteps')}</h2>
                    <p>{t('setup.msgNextPage')}</p>
                    <Button
                        variant="info"
                        onClick={() => router.push('/prognose')}
                    >
                        {t('setup.nextPageButton')}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default InputPage;
