import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { pinyin } from 'pinyin-pro';
import { supabase } from '../../lib/supabase';
import './AdminStyles.css';

const ImportModal = ({ isOpen, onClose, onImportSuccess }) => {
    const [importing, setImporting] = useState(false);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        setImporting(true);

        try {
            // 1. Fetch existing English phrases to check for duplicates
            const { data: existingPhrases, error: fetchError } = await supabase
                .from('phrases')
                .select('english');

            if (fetchError) throw fetchError;

            const existingEnglishSet = new Set(existingPhrases.map(p => p.english.toLowerCase().trim()));

            // 2. Parse CSV with header detection
            Papa.parse(file, {
                header: true, // Enable header-based parsing
                skipEmptyLines: true,
                transformHeader: (header) => header.toLowerCase().trim(),
                complete: async (results) => {
                    try {
                        const rawRows = results.data;
                        const validRows = [];
                        let skippedCount = 0;

                        // 3. Process each row
                        for (let i = 0; i < rawRows.length; i++) {
                            const row = rawRows[i];

                            // Extract fields by header name (case-insensitive)
                            const englishText = row['english'] || row['en'];
                            const chineseText = row['chinese'] || row['zh'] || row['mandarin'];
                            const exampleText = row['example'] || row['simple example phrase in chinese'] || row['sentence'] || row['usage'];
                            const categoryText = row['category'] || row['cat'];
                            const difficultyText = row['difficulty'] || row['difficulty_level'] || row['level'];

                            // Basic validation
                            if (!englishText || !chineseText) {
                                console.warn('Skipping invalid row:', row);
                                continue;
                            }

                            // Duplicate check
                            if (existingEnglishSet.has(englishText.toLowerCase().trim())) {
                                skippedCount++;
                                continue;
                            }

                            // Generate Pinyin
                            const phrasePinyin = pinyin(chineseText);

                            validRows.push({
                                english: englishText.trim(),
                                chinese: chineseText.trim(),
                                pinyin: phrasePinyin,
                                category: categoryText || 'general',
                                difficulty_level: parseInt(difficultyText) || 1,
                                is_active: true,
                                example: exampleText ? exampleText.trim() : null
                            });
                        }

                        if (validRows.length > 0) {
                            // 4. Batch insert
                            const { error: insertError } = await supabase
                                .from('phrases')
                                .insert(validRows);

                            if (insertError) throw insertError;
                        }

                        setStats({
                            total: rawRows.length,
                            imported: validRows.length,
                            skipped: skippedCount
                        });

                        if (validRows.length > 0) {
                            onImportSuccess();
                        }

                    } catch (err) {
                        setError(err.message);
                    } finally {
                        setImporting(false);
                    }
                },
                error: (err) => {
                    setError('Failed to parse CSV: ' + err.message);
                    setImporting(false);
                }
            });

        } catch (err) {
            setError(err.message);
            setImporting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Import Phrases from CSV</h2>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {!stats ? (
                        <>
                            <p className="modal-description">
                                Upload a CSV file with columns: <code>english</code>, <code>chinese</code>.
                                <br />
                                Optional: <code>category</code>, <code>difficulty_level</code>, <code>example</code>.
                                <br />
                                Pinyin will be auto-generated if missing. Duplicates will be skipped.
                            </p>

                            <div className="file-upload-area">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                    disabled={importing}
                                />
                            </div>

                            {importing && (
                                <div className="import-loading">
                                    <div className="loading-spinner small"></div>
                                    <p>Processing and uploading...</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`import-stats ${stats.imported > 0 ? 'success' : 'warning'}`}>
                            <h3>Import Complete!</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{stats.total}</span>
                                    <span className="stat-label">Total Rows</span>
                                </div>
                                <div className="stat-item success">
                                    <span className="stat-value">{stats.imported}</span>
                                    <span className="stat-label">Imported</span>
                                </div>
                                <div className="stat-item warning">
                                    <span className="stat-value">{stats.skipped}</span>
                                    <span className="stat-label">Duplicates Skipped</span>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-primary" onClick={onClose}>Done</button>
                            </div>
                        </div>
                    )}

                    {error && <div className="dashboard-error small">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
