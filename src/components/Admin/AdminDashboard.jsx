import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PhraseForm from './PhraseForm';
import ImportModal from './ImportModal';
import './AdminStyles.css';

const AdminDashboard = () => {
    const [phrases, setPhrases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPhrase, setEditingPhrase] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPhrases();
    }, []);

    const fetchPhrases = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('phrases')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPhrases(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('phrases')
                .insert([formData])
                .select();

            if (error) throw error;

            setPhrases([data[0], ...phrases]);
            setIsCreating(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('phrases')
                .update(formData)
                .eq('id', editingPhrase.id);

            if (error) throw error;

            setPhrases(phrases.map(p => p.id === editingPhrase.id ? { ...p, ...formData } : p));
            setEditingPhrase(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this phrase?')) return;

        try {
            const { error, count } = await supabase
                .from('phrases')
                .delete({ count: 'exact' })
                .eq('id', id);

            if (error) throw error;

            if (count === 0) {
                throw new Error('Could not delete phrase. You may not have permission.');
            }

            setPhrases(phrases.filter(p => p.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (isCreating || editingPhrase) {
        return (
            <div className="admin-container">
                <div className="admin-header">
                    <h1 className="admin-title">
                        {isCreating ? 'Add New Phrase' : 'Edit Phrase'}
                    </h1>
                </div>
                <div className="phrase-form-card">
                    <PhraseForm
                        initialData={editingPhrase}
                        onSubmit={isCreating ? handleCreate : handleUpdate}
                        onCancel={() => {
                            setIsCreating(false);
                            setEditingPhrase(null);
                        }}
                        loading={loading}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        className="btn-icon"
                        onClick={() => {
                            window.history.pushState({}, '', '/');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        title="Back to App"
                        style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                    >
                        ←
                    </button>
                    <h1 className="admin-title">Content Management</h1>
                </div>
                <div className="action-buttons">
                    <button className="btn-secondary" onClick={() => setIsImporting(true)}>
                        Import CSV
                    </button>
                    <button className="btn-primary" onClick={() => setIsCreating(true)}>
                        + Add Phrase
                    </button>
                </div>
            </div>

            {error && <div className="dashboard-error">{error}</div>}

            <div className="admin-table-container">
                {loading && phrases.length === 0 ? (
                    <div className="dashboard-loading">Loading...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>English</th>
                                <th>Chinese</th>
                                <th>Pinyin</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phrases.map(phrase => (
                                <tr key={phrase.id}>
                                    <td>{phrase.english}</td>
                                    <td>{phrase.chinese}</td>
                                    <td>{phrase.pinyin || '-'}</td>
                                    <td>
                                        <span className="category-tag">{phrase.category || 'General'}</span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-secondary"
                                                onClick={() => setEditingPhrase(phrase)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleDelete(phrase.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ImportModal
                isOpen={isImporting}
                onClose={() => setIsImporting(false)}
                onImportSuccess={() => {
                    fetchPhrases();
                }}
            />
        </div>
    );
};

export default AdminDashboard;
