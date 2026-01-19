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
    const [selectedIds, setSelectedIds] = useState(new Set());

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

    // Bulk Actions Handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(phrases.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleToggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} phrases?`)) return;

        try {
            setLoading(true);
            const { error, count } = await supabase
                .from('phrases')
                .delete({ count: 'exact' })
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            if (count === 0) {
                throw new Error('Could not delete phrases. Check permissions.');
            }

            setPhrases(phrases.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkCategory = async () => {
        const newCategory = window.prompt("Enter new category for selected phrases:");
        if (newCategory === null) return; // Cancelled

        try {
            setLoading(true);
            const { error } = await supabase
                .from('phrases')
                .update({ category: newCategory })
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            setPhrases(phrases.map(p =>
                selectedIds.has(p.id) ? { ...p, category: newCategory } : p
            ));
            setSelectedIds(new Set());
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

            {selectedIds.size > 0 && (
                <div className="bulk-actions-bar">
                    <div className="selected-count">
                        {selectedIds.size} selected
                    </div>
                    <div className="bulk-actions">
                        <button className="btn-secondary" onClick={() => setSelectedIds(new Set())}>
                            Deselect All
                        </button>
                        <button className="btn-secondary" onClick={handleBulkCategory}>
                            Change Category
                        </button>
                        <button className="btn-danger" onClick={handleBulkDelete}>
                            Delete Selected
                        </button>
                    </div>
                </div>
            )}

            <div className="admin-table-container">
                {loading && phrases.length === 0 ? (
                    <div className="dashboard-loading">Loading...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={phrases.length > 0 && selectedIds.size === phrases.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>English</th>
                                <th>Chinese</th>
                                <th>Pinyin</th>
                                <th>Example</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phrases.map(phrase => (
                                <tr key={phrase.id} className={selectedIds.has(phrase.id) ? 'selected-row' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(phrase.id)}
                                            onChange={() => handleToggleSelect(phrase.id)}
                                        />
                                    </td>
                                    <td>{phrase.english}</td>
                                    <td>{phrase.chinese}</td>
                                    <td>{phrase.pinyin || '-'}</td>
                                    <td>
                                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={phrase.example}>
                                            {phrase.example || '-'}
                                        </div>
                                    </td>
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
