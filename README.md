# Language Pronunciation Drill

A modern web application for learning Mandarin Chinese pronunciation through repetitive audio drills.

## Features

- **Dashboard UI**: Professional split-screen layout with sidebar navigation
- **Audio Drills**: Practice phrases with customizable repetition counts
- **Voice Control**: Adjustable playback speed and voice selection
- **Progress Tracking**: 
  - Session progress per phrase
  - Lifetime repetition tracking (persisted in localStorage)
- **Waveform Visualization**: Animated audio visualization during playback
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **React** + **Vite**: Fast development and build
- **Web Speech API**: Browser-native text-to-speech
- **CSS Variables**: Dark mode with teal/coral accents

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Usage

1. Open the app at `http://localhost:5173`
2. Adjust settings:
   - **Playback Speed**: 0.5x - 1.5x
   - **Chinese Repetitions**: 1-10 times
   - **Voice Selection**: Choose English and Mandarin voices
3. Click "Play All Phrases" to start the drill
4. Track your progress in the sidebar

## Project Structure

```
src/
├── components/
│   ├── AudioDrill.jsx       # Main drill component
│   └── AudioDrill.css       # Dashboard styling
├── App.jsx                  # Root component
├── index.css                # Global styles & variables
└── main.jsx                 # Entry point
```

## Roadmap

- [ ] Supabase authentication
- [ ] Cloud-synced progress tracking
- [ ] Dynamic phrase loading from database
- [ ] Category filtering
- [ ] Custom phrase creation

## License

MIT
