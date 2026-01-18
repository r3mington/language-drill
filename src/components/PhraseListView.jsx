import './PhraseListView.css';

const PhraseListView = ({ phrases, onBack, onNavigate }) => {
    return (
        <div className="phrase-list-view">
            {/* Header */}
            <div className="list-header">
                <button
                    className="back-btn"
                    onClick={onBack}
                    aria-label="Back to drill"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>

                <h2 className="list-title">{phrases.length} Phrases</h2>

                <button
                    className="filter-btn"
                    onClick={() => onNavigate('settings')}
                    aria-label="Filter settings"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="21" x2="4" y2="14" />
                        <line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" />
                        <line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" />
                        <line x1="9" y1="8" x2="15" y2="8" />
                        <line x1="17" y1="16" x2="23" y2="16" />
                    </svg>
                </button>
            </div>

            {/* Phrase Cards */}
            <div className="phrase-cards-container">
                {phrases.length === 0 ? (
                    <div className="empty-state">
                        <p>No phrases match your filters</p>
                        <button onClick={() => onNavigate('settings')}>
                            Adjust Settings
                        </button>
                    </div>
                ) : (
                    phrases.map((phrase, index) => (
                        <div key={index} className="phrase-card">
                            <p className="card-english">{phrase.english}</p>
                            <p className="card-chinese">{phrase.chinese}</p>
                            {phrase.pinyin && (
                                <p className="card-pinyin">{phrase.pinyin}</p>
                            )}
                            {phrase.category && (
                                <span className="card-category">{phrase.category}</span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PhraseListView;
