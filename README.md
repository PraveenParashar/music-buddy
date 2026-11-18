# 🎵 Tune Quest - Music Learning Game

A **Duolingo-style music learning game** for kids and beginners. Learn music theory, ear training, and popular songs through interactive lessons and gamification.

## ✨ Features

### 📚 6 Learning Units
1. **Meet the notes** - Recognize notes by ear
2. **Higher or lower** - Compare pitch differences  
3. **Count the beats** - Rhythm training
4. **Climb the scale** - Sequence prediction
5. **Music theory 101** - Learn music fundamentals
6. **Learn songs** - Master famous melodies

### 🎵 4 Song Lessons
- Twinkle Twinkle Little Star
- Happy Birthday
- Mary Had A Little Lamb
- Jingle Bells

### 🎯 Interactive Features
- 🎹 Free piano to explore sounds
- 📊 Full song notation with clickable notes
- 🏅 Achievement badges system
- ⭐ XP points & day streak tracking
- 🎮 Lives-based lesson system (3 lives per lesson)
- 💾 Local storage persistence

### 📖 Music Theory Lessons
- What are notes?
- Intervals explained
- Major scale concepts
- Time signatures
- Piano keyboard layout
- Octaves & semitones

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Safari, Firefox, Edge)
- No installation needed!

### Run Locally
```bash
# Navigate to project directory
cd music-buddy

# Start a simple HTTP server (Python 3)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

Or use any other HTTP server:
```bash
# Node.js
npx http-server

# Ruby
ruby -run -ehttpd . -p8000
```

## 🎮 How to Play

1. **Learn Tab** - Choose a lesson unit and complete questions
2. **Piano Tab** - Free explore mode to practice notes
3. **Badges Tab** - View unlocked achievements

### Song Learning Flow
1. Click a song lesson
2. See the **full notation sheet** with all notes labeled
3. Click notes to hear them individually
4. Click "Play all" to hear the complete melody
5. Start the **interactive quiz** to master the song

## 🛠️ Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No dependencies!
- **Web Audio API** - Procedurally generated sounds
- **Service Worker** - Offline support

## 📁 Project Structure

```
music-buddy/
├── index.html          # Main HTML file
├── app.js              # Core game logic (22KB)
├── styles.css          # All styling (9KB)
├── sw.js               # Service worker for offline
├── manifest.webmanifest # PWA manifest
└── icon.svg            # App icon
```

## 🎓 Music Concepts Covered

- Note identification (C, D, E, F, G, A, B)
- Intervals (2nd, 3rd, 4th, 5th, etc.)
- Scales and octaves
- Pitch comparison
- Rhythm and beats
- Time signatures (2/4, 3/4, 4/4)
- Major and minor scales
- Melody recognition

## 🏆 Achievement System

Unlock badges by:
- ✅ Completing lessons
- 💯 Earning perfect scores (3 stars)
- 🔥 Maintaining practice streaks
- ⭐ Accumulating XP points
- 🎶 Mastering songs perfectly

## 🔊 Sound Engine

Uses **Web Audio API** to generate:
- Piano-like tones with triangle wave + sine overtone
- Click sounds for beat counting
- Smooth note transitions
- No audio files needed!

## 📱 Progressive Web App (PWA)

- Works offline after first visit
- Installable on mobile devices
- Full screen capable
- Home screen icon

## 🎨 Design Features

- **Mobile-first responsive design**
- **Accessible color palette**
- **Touch-friendly interface**
- **Clear visual feedback**
- **Smooth animations**

## 💡 Learning Approach

Inspired by successful language learning apps:
- ✅ Short, focused lessons
- ✅ Immediate feedback
- ✅ Spaced repetition
- ✅ Progress tracking
- ✅ Gamification rewards
- ✅ No time pressure

## 📝 License

MIT - Feel free to use, modify, and share!

## 👤 Author

Created by [Praveen Parashar](https://github.com/PraveenParashar)

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest new songs
- Add more lessons
- Improve the UI
- Fix accessibility issues

## 🚀 Future Enhancements

- [ ] More songs and lessons
- [ ] Difficulty levels
- [ ] Multiplayer mode
- [ ] Stats & analytics dashboard
- [ ] Note reading from staff
- [ ] Interval ear training game
- [ ] Custom lesson creator
- [ ] Mobile app version

---

**Happy learning! 🎵✨**
