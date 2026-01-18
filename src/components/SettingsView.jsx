import './SettingsView.css';

const SettingsView = ({
    playbackRate,
    chineseRepetitions,
    selectedCategory,
    categories,
    isShuffle,
    availableVoices,
    selectedEnglishVoice,
    selectedChineseVoice,
    onPlaybackRateChange,
    onRepetitionsChange,
    onCategoryChange,
    onShuffleToggle,
    onEnglishVoiceChange,
    onChineseVoiceChange,
    onBack
}) => {
    return (
        <div className="settings-view">
            {/* Header */}
            <div className="settings-header">
                <button
                    className="back-btn"
                    onClick={onBack}
                    aria-label="Back"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2>Settings</h2>
                <div style={{ width: '44px' }} /> {/* Spacer for centering */}
            </div>

            {/* Settings Content */}
            <div className="settings-content">
                {/* Playback Section */}
                <div className="settings-section">
                    <h3 className="section-title">Playback</h3>

                    <div className="setting-group">
                        <label className="setting-label">Speed</label>
                        <select
                            value={playbackRate}
                            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
                            className="setting-dropdown"
                        >
                            <option value="0.5">0.5x (Very Slow)</option>
                            <option value="0.6">0.6x</option>
                            <option value="0.7">0.7x</option>
                            <option value="0.75">0.75x (Slow)</option>
                            <option value="0.85">0.85x</option>
                            <option value="1.0">1.0x (Normal)</option>
                            <option value="1.1">1.1x</option>
                            <option value="1.25">1.25x (Fast)</option>
                            <option value="1.5">1.5x (Very Fast)</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">Repetitions</label>
                        <select
                            value={chineseRepetitions}
                            onChange={(e) => onRepetitionsChange(parseInt(e.target.value))}
                            className="setting-dropdown"
                        >
                            <option value="1">1x</option>
                            <option value="2">2x</option>
                            <option value="3">3x</option>
                            <option value="4">4x</option>
                            <option value="5">5x</option>
                            <option value="6">6x</option>
                            <option value="7">7x</option>
                            <option value="8">8x</option>
                            <option value="9">9x</option>
                            <option value="10">10x</option>
                        </select>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="settings-section">
                    <h3 className="section-title">Filter</h3>

                    <div className="setting-row">
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="category-dropdown"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <div className="shuffle-toggle">
                            <span className="toggle-label">Shuffle</span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={isShuffle}
                                    onChange={(e) => onShuffleToggle(e.target.checked)}
                                />
                                <span className="slider-toggle round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Voice Section */}
                <div className="settings-section">
                    <h3 className="section-title">Voice</h3>

                    <div className="voice-selects">
                        <div className="voice-group">
                            <label className="voice-label">English Voice</label>
                            <select
                                value={selectedEnglishVoice}
                                onChange={(e) => onEnglishVoiceChange(e.target.value)}
                                className="voice-dropdown"
                            >
                                {availableVoices.en.map((voice, idx) => (
                                    <option key={idx} value={voice.name}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="voice-group">
                            <label className="voice-label">Chinese Voice</label>
                            <select
                                value={selectedChineseVoice}
                                onChange={(e) => onChineseVoiceChange(e.target.value)}
                                className="voice-dropdown"
                            >
                                {availableVoices.zh.map((voice, idx) => (
                                    <option key={idx} value={voice.name}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
