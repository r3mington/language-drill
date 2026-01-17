import { useState, useRef, useEffect } from 'react';
import './AudioDrill.css';

const AudioDrill = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.85);
  const [chineseRepetitions, setChineseRepetitions] = useState(3);
  const [phraseRepetitionCounts, setPhraseRepetitionCounts] = useState({});
  const [lifetimeRepetitions, setLifetimeRepetitions] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('lifetimeRepetitions');
    return saved ? JSON.parse(saved) : {};
  });
  const [availableVoices, setAvailableVoices] = useState({ en: [], zh: [] });
  const [selectedEnVoice, setSelectedEnVoice] = useState(null);
  const [selectedZhVoice, setSelectedZhVoice] = useState(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceQueueRef = useRef([]);
  const selectedVoicesRef = useRef({ en: null, zh: null });

  // Define phrase pairs
  const phrasePairs = [
    {
      english: 'Good morning, my name is Remi',
      chinese: '早上好我的名字是黑米'
    },
    {
      english: "Today I'm really happy",
      chinese: '今天我很开心'
    },
  ];

  // Generate drill sequence: for each phrase, play English once, then Chinese N times
  const generateDrillSequence = (repetitions) => {
    const sequence = [];
    phrasePairs.forEach((pair) => {
      // English once
      sequence.push({
        text: pair.english,
        lang: 'en-US',
        label: pair.english,
        phraseId: pair.english
      });
      // Chinese N times based on user setting
      for (let i = 0; i < repetitions; i++) {
        sequence.push({
          text: pair.chinese,
          lang: 'zh-CN',
          label: pair.chinese,
          phraseId: pair.english
        });
      }
    });
    return sequence;
  };

  const drillSequence = generateDrillSequence(chineseRepetitions);

  // Save lifetime repetitions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lifetimeRepetitions', JSON.stringify(lifetimeRepetitions));
  }, [lifetimeRepetitions]);

  // Load and select best voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length === 0) {
        return; // Voices not loaded yet
      }

      // Select best English voice
      // Priority: Enhanced > Premium > Neural > Standard
      const enVoice =
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('enhanced')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('premium')) ||
        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('neural')) ||
        voices.find(v => v.lang.startsWith('en-US')) ||
        voices.find(v => v.lang.startsWith('en'));

      // Select best Mandarin voice
      // Priority: Enhanced > Premium > Ting-Ting > Any zh-CN > Any zh
      const zhVoice =
        voices.find(v => v.lang.startsWith('zh') && v.name.toLowerCase().includes('enhanced')) ||
        voices.find(v => v.lang.startsWith('zh') && v.name.toLowerCase().includes('premium')) ||
        voices.find(v => v.name.toLowerCase().includes('ting-ting')) ||
        voices.find(v => v.name.toLowerCase().includes('sin-ji')) ||
        voices.find(v => v.lang === 'zh-CN') ||
        voices.find(v => v.lang.startsWith('zh'));

      // Store all available voices for each language
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      const zhVoices = voices.filter(v => v.lang.startsWith('zh'));

      setAvailableVoices({ en: enVoices, zh: zhVoices });
      setSelectedEnVoice(enVoice);
      setSelectedZhVoice(zhVoice);
      selectedVoicesRef.current = { en: enVoice, zh: zhVoice };
      setVoicesLoaded(true);

      // Log selected voices for debugging
      console.log('Selected English voice:', enVoice?.name || 'Default');
      console.log('Selected Mandarin voice:', zhVoice?.name || 'Default');
    };

    // Load voices immediately if available
    loadVoices();

    // Also listen for voiceschanged event (Chrome needs this)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speakNext = (index) => {
    if (index >= drillSequence.length) {
      setIsPlaying(false);
      setCurrentWord(null);
      return;
    }

    const { text, lang, label, phraseId } = drillSequence[index];
    setCurrentWord(label);

    // Track Chinese repetitions
    if (lang === 'zh-CN') {
      // Session counter
      setPhraseRepetitionCounts(prev => ({
        ...prev,
        [phraseId]: (prev[phraseId] || 0) + 1
      }));

      // Lifetime counter (persisted to localStorage)
      setLifetimeRepetitions(prev => ({
        ...prev,
        [phraseId]: (prev[phraseId] || 0) + 1
      }));
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    // Assign the best voice for this language
    const voiceKey = lang.startsWith('zh') ? 'zh' : 'en';
    if (selectedVoicesRef.current[voiceKey]) {
      utterance.voice = selectedVoicesRef.current[voiceKey];
    }

    utterance.onend = () => {
      // Small pause between words
      setTimeout(() => {
        speakNext(index + 1);
      }, 500);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setCurrentWord(null);
    };

    synthRef.current.speak(utterance);
  };

  const handlePlay = () => {
    if (isPlaying) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    setIsPlaying(true);
    speakNext(0);
  };

  const handleStop = () => {
    synthRef.current.cancel();
    setIsPlaying(false);
    setCurrentWord(null);
  };

  const handleEnVoiceChange = (e) => {
    const voice = availableVoices.en.find(v => v.name === e.target.value);
    setSelectedEnVoice(voice);
    selectedVoicesRef.current.en = voice;
  };

  const handleZhVoiceChange = (e) => {
    const voice = availableVoices.zh.find(v => v.name === e.target.value);
    setSelectedZhVoice(voice);
    selectedVoicesRef.current.zh = voice;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Phrases</h2>
          <span className="phrase-count">{phrasePairs.length} total</span>
        </div>

        <div className="phrase-list">
          {phrasePairs.map((pair, idx) => (
            <div
              key={idx}
              className={`phrase-item ${currentWord === pair.english || currentWord === pair.chinese ? 'active' : ''
                }`}
            >
              <div className="phrase-item-header">
                <span className="phrase-number">{idx + 1}</span>
                <div className="phrase-check">
                  {/* Checkmark placeholder - could track completion state */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div className="phrase-text">
                <div className="phrase-en">{pair.english}</div>
                <div className="phrase-zh">{pair.chinese}</div>
              </div>
              <div className="phrase-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, ((phraseRepetitionCounts[pair.english] || 0) / chineseRepetitions) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  {phraseRepetitionCounts[pair.english] || 0} / {chineseRepetitions}
                </div>
                <div className="lifetime-text">
                  Total ever: {lifetimeRepetitions[pair.english] || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1 className="app-title">Language Pronunciation Drill</h1>
          <p className="app-subtitle">Master Mandarin pronunciation through repetition</p>
        </div>

        {/* Current Phrase Display */}
        <div className="current-phrase-display">
          <div className="phrase-display-card">
            <div className="phrase-en-large">
              {currentWord && phrasePairs.find(p => p.english === currentWord || p.chinese === currentWord)?.english ||
                phrasePairs[0]?.english || 'Ready to start'}
            </div>
            <div className="phrase-zh-large">
              {currentWord && phrasePairs.find(p => p.english === currentWord || p.chinese === currentWord)?.chinese ||
                phrasePairs[0]?.chinese || '准备开始'}
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="waveform-container">
            <div className={`waveform ${isPlaying ? 'playing' : ''}`}>
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    height: `${20 + Math.random() * 60}%`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Play/Stop Controls */}
        <div className="controls-section">
          {!isPlaying ? (
            <button className="play-button-large" onClick={handlePlay} aria-label="Play drill">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Play All Phrases</span>
            </button>
          ) : (
            <button className="stop-button-large" onClick={handleStop} aria-label="Stop drill">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-value">{chineseRepetitions}x</div>
            <div className="stat-label">repetitions</div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-value">{playbackRate.toFixed(2)}x</div>
            <div className="stat-label">speed</div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="settings-section">
          <h3 className="settings-title">Settings</h3>

          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="speed-slider">
                Playback Speed
              </label>
              <input
                id="speed-slider"
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                disabled={isPlaying}
              />
              <div className="slider-labels">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>1.5x</span>
              </div>
            </div>

            <div className="setting-item">
              <label htmlFor="repetition-slider">
                Chinese Repetitions
              </label>
              <input
                id="repetition-slider"
                type="range"
                min="1"
                max="10"
                step="1"
                value={chineseRepetitions}
                onChange={(e) => setChineseRepetitions(parseInt(e.target.value))}
                disabled={isPlaying}
              />
              <div className="slider-labels">
                <span>1x</span>
                <span>5x</span>
                <span>10x</span>
              </div>
            </div>

            {voicesLoaded && (
              <>
                <div className="setting-item">
                  <label htmlFor="en-voice">English Voice</label>
                  <select
                    id="en-voice"
                    value={selectedEnVoice?.name || ''}
                    onChange={handleEnVoiceChange}
                    disabled={isPlaying}
                  >
                    {availableVoices.en.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <label htmlFor="zh-voice">Mandarin Voice</label>
                  <select
                    id="zh-voice"
                    value={selectedZhVoice?.name || ''}
                    onChange={handleZhVoiceChange}
                    disabled={isPlaying}
                  >
                    {availableVoices.zh.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AudioDrill;
