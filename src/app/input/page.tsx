'use client';

import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { parseString } from 'xml2js';
import styles from './page.module.css';
import { useTranslation } from 'react-i18next';

const InputPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [jsonData, setJsonData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mappingError, setMappingError] = useState<boolean>(false);
    const [dataInitialized, setDataInitialized] = useState<boolean>(false);

    // XML zu JSON konvertieren
    const convertXmlToJson = (xml: string) => {
        parseString(xml, { explicitArray: false }, (err, result) => {
            if (err) {
                setMappingError(true);
                console.error('XML Parse Fehler:', err);
            } else {
                setJsonData(result);
                setMappingError(false);
            }
        });
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

    // Datenverarbeitung simulieren (Hier später API Call einbauen!)
    const mapXmlData = async () => {
        setIsLoading(true);
        setMappingError(false);
        try {
            console.log('Mapping Data:', jsonData);
            // Simuliere Verzögerung
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Setze Dateninitialisierung erfolgreich
            setDataInitialized(true);
        } catch (error) {
            setMappingError(true);
            console.error('Mapping Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className={styles.container}>
            <h2>{t('setup.title')}</h2>
            <p>{t('setup.description')}</p>

            <Form className={styles.form}>
                <Form.Group controlId="xmlUpload" className="mb-3">
                    <Form.Label>{t('setup.selectXmlButton')}</Form.Label>
                    <Form.Control type="file" accept=".xml" onChange={handleFileChange} />
                    <Form.Text className="text-muted">
                        {t('setup.selectXmlButton_loadtip')}
                    </Form.Text>
                </Form.Group>

                {mappingError && (
                    <Alert variant="danger">{t('setup.xmlAlertDanger')}</Alert>
                )}
                {dataInitialized && (
                    <Alert variant="success">{t('setup.xmlAlertSuccess')}</Alert>
                )}

                <Button
                    variant="outline-info"
                    className={styles.button}
                    onClick={mapXmlData}
                    disabled={!jsonData || isLoading}
                >
                    {isLoading && <Spinner size="sm" className="me-2" />}
                    {t('setup.loadDataButton')}
                </Button>
            </Form>

            {dataInitialized && (
                <div className={styles.nextSteps}>
                    <h2>{t('setup.titleNextSteps')}</h2>
                    <p>{t('setup.msgNextPage')}</p>
                    <Button variant="info" onClick={() => router.push('/sellwish')}>
                        {t('setup.nextPageButton')}
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default InputPage;
