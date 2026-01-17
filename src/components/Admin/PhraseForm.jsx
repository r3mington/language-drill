import { useState, useEffect } from 'react';
import './AdminStyles.css';

const PhraseForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        english: '',
        chinese: '',
        pinyin: '',
        category: 'general',
        difficulty_level: 1,
        sort_order: 0,
        is_active: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="phrase-form">
            <div className="form-group">
                <label>English Phrase</label>
                <input
                    type="text"
                    name="english"
                    value={formData.english}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Good morning"
                />
            </div>

            <div className="form-group">
                <label>Chinese (Hanzi)</label>
                <input
                    type="text"
                    name="chinese"
                    value={formData.chinese}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 早上好"
                />
            </div>

            <div className="form-group">
                <label>Pinyin</label>
                <input
                    type="text"
                    name="pinyin"
                    value={formData.pinyin}
                    onChange={handleChange}
                    placeholder="e.g. Zǎoshang hǎo"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Category</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        list="categories"
                    />
                    <datalist id="categories">
                        <option value="general" />
                        <option value="greetings" />
                        <option value="emotions" />
                        <option value="travel" />
                        <option value="food" />
                    </datalist>
                </div>

                <div className="form-group">
                    <label>Difficulty (1-5)</label>
                    <input
                        type="number"
                        name="difficulty_level"
                        value={formData.difficulty_level}
                        onChange={handleChange}
                        min="1"
                        max="5"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : (initialData ? 'Update Phrase' : 'Add Phrase')}
                </button>
            </div>
        </form>
    );
};

export default PhraseForm;
