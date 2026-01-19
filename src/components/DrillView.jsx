import { useState } from 'react';
import './DrillView.css';

const DrillView = ({
    currentPhrase,
    isPlaying,
    onPlayPause,
    onNavigate
}) => {
    if (!currentPhrase) {
        return (
            <div className="drill-view">
                <div className="no-phrases">
                    <p>No phrases available</p>
                    <p className="hint">Add phrases in the Admin panel</p>
                </div>
            </div>
        );
    }

    return (
        <div className="drill-view">
            {/* English Section - Top Half */}
            <div className="phrase-section english-section">
                <div className="phrase-content">
                    <p className="phrase-text">{currentPhrase.english}</p>
                </div>
            </div>

            {/* Control Strip - Middle */}
            <div className="control-strip">
                <button
                    className="control-btn play-btn"
                    onClick={onPlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <button
                    className="control-btn cards-btn"
                    onClick={() => onNavigate('list')}
                    aria-label="View phrase list"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                </button>

                <button
                    className="control-btn settings-btn"
                    onClick={() => onNavigate('settings')}
                    aria-label="Settings"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                    </svg>
                </button>
            </div>

            {/* Chinese Section - Bottom Half */}
            <div className="phrase-section chinese-section">
                <div className="phrase-content">
                    <p className="phrase-text chinese-text">{currentPhrase.chinese}</p>
                    {currentPhrase.pinyin && (
                        <p className="phrase-pinyin">{currentPhrase.pinyin}</p>
                    )}
                    {currentPhrase.example && (
                        <p className="phrase-example">{currentPhrase.example}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrillView;
