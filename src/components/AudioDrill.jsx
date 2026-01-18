import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePhrases } from '../hooks/usePhrases';
import { useUserProgress } from '../hooks/useUserProgress';
import { useWakeLock } from '../hooks/useWakeLock';
import DrillView from './DrillView';
import PhraseListView from './PhraseListView';
import SettingsView from './SettingsView';
import './AudioDrill.css';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const AudioDrill = () => {
  const { user, signOut } = useAuth();
  const { phrases, loading: phrasesLoading, error: phrasesError } = usePhrases();
  const { progress, updateProgress, loading: progressLoading } = useUserProgress();
  const { requestLock, releaseLock } = useWakeLock();

  const [isPlaying, setIsPlaying] = useState(false);



  // Manage Wake Lock based on playback state
  useEffect(() => {
    if (isPlaying) {
      requestLock();
    } else {
      releaseLock();
    }
  }, [isPlaying, requestLock, releaseLock]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('drill'); // 'drill' | 'list' | 'settings'
  const [currentWord, setCurrentWord] = useState(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.85);
  const [chineseRepetitions, setChineseRepetitions] = useState(3);
  const [phraseRepetitionCounts, setPhraseRepetitionCounts] = useState({});
  const [availableVoices, setAvailableVoices] = useState({ en: [], zh: [] });
  const [selectedEnVoice, setSelectedEnVoice] = useState(null);
  const [selectedZhVoice, setSelectedZhVoice] = useState(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceQueueRef = useRef([]);
  const selectedVoicesRef = useRef({ en: null, zh: null });

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set(phrases.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort()];
  }, [phrases]);

  // Transform database phrases to match existing format
  // Memoize to prevent re-shuffling on every render unless dependencies change
  const phrasePairs = useMemo(() => {
    let pairs = phrases.map(p => ({
      id: p.id,
      english: p.english,
      chinese: p.chinese,
      pinyin: p.pinyin,
      category: p.category
    }));

    // Filter by category
    if (selectedCategory !== 'All') {
      pairs = pairs.filter(p => p.category === selectedCategory);
    }

    if (isShuffle) {
      return shuffleArray(pairs);
    }
    return pairs;
  }, [phrases, isShuffle, selectedCategory]);

  // Generate drill sequence: for each phrase, play English once, then Chinese N times
  const drillSequence = useMemo(() => {
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
      for (let i = 0; i < chineseRepetitions; i++) {
        sequence.push({
          text: pair.chinese,
          lang: 'zh-CN',
          label: pair.chinese,
          phraseId: pair.english
        });
      }
    });
    return sequence;
  }, [phrasePairs, chineseRepetitions]);

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

  // Store drillSequence in ref so the recursive speakNext loop always sees the latest version
  const drillSequenceRef = useRef([]);

  useEffect(() => {
    drillSequenceRef.current = drillSequence;
  }, [drillSequence]);

  const speakNext = (index) => {
    const sequence = drillSequenceRef.current;

    if (index >= sequence.length) {
      setIsPlaying(false);
      setCurrentWord(null);
      return;
    }

    const { text, lang, label, phraseId } = sequence[index];
    setCurrentWord(label);

    // Track Chinese repetitions
    if (lang === 'zh-CN') {
      // Session counter
      setPhraseRepetitionCounts(prev => ({
        ...prev,
        [phraseId]: (prev[phraseId] || 0) + 1
      }));

      // Sync to database (lifetime counter)
      updateProgress(phraseId, 1);
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

  const handleEnVoiceChange = (voiceName) => {
    const voice = availableVoices.en.find(v => v.name === voiceName);
    setSelectedEnVoice(voiceName);
    selectedVoicesRef.current.en = voice;
  };

  const handleZhVoiceChange = (voiceName) => {
    const voice = availableVoices.zh.find(v => v.name === voiceName);
    setSelectedZhVoice(voiceName);
    selectedVoicesRef.current.zh = voice;
  };

  // Show loading state while fetching phrases
  if (phrasesLoading || progressLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading phrases...</p>
      </div>
    );
  }

  // Show error state if phrases failed to load
  if (phrasesError) {
    return (
      <div className="dashboard-error">
        <p>Error loading phrases: {phrasesError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Get current phrase for display based on what's being spoken
  const currentPhrase = currentWord
    ? phrasePairs.find(p => p.english === currentWord || p.chinese === currentWord) || phrasePairs[0]
    : phrasePairs[0];

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  // View routing
  if (currentView === 'list') {
    return (
      <PhraseListView
        phrases={phrasePairs}
        onBack={() => setCurrentView('drill')}
        onNavigate={setCurrentView}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <SettingsView
        playbackRate={playbackRate}
        chineseRepetitions={chineseRepetitions}
        selectedCategory={selectedCategory}
        categories={categories}
        isShuffle={isShuffle}
        availableVoices={availableVoices}
        selectedEnglishVoice={selectedEnVoice}
        selectedChineseVoice={selectedZhVoice}
        onPlaybackRateChange={setPlaybackRate}
        onRepetitionsChange={setChineseRepetitions}
        onCategoryChange={setSelectedCategory}
        onShuffleToggle={setIsShuffle}
        onEnglishVoiceChange={handleEnVoiceChange}
        onChineseVoiceChange={handleZhVoiceChange}
        onBack={() => setCurrentView('drill')}
      />
    );
  }

  // Default: drill view
  return (
    <DrillView
      currentPhrase={currentPhrase}
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      onNavigate={setCurrentView}
    />
  );
};

export default AudioDrill;
