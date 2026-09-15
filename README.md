# 🐛 Debugg — Learn to Code by Debugging

**The Duolingo of programming — but for real developers.**

Debugg is a gamified coding-education platform where instead of writing code from scratch, you **fix real, buggy code**. Spot the bug, apply the fix, run it, and earn XP, badges, and leaderboard rank as you level up across languages like JavaScript, Python, Java, and HTML.

![Debugg Landing Page](<img width="1917" height="821" alt="image" src="https://github.com/user-attachments/assets/7d2f4636-5cb1-454c-bef3-2ce3ce740ad2" />)


---

## ✨ Features

- 🐛 **Debug Real Code** — Fix actual buggy snippets across multiple languages (JavaScript, Python, Java, HTML, and more).
- 🎮 **Levels & XP** — Progress through difficulty tiers, unlock new challenges, and earn XP for every correct fix.
- 🏆 **Leaderboard** — Compete on a global leaderboard, ranked by XP.
- 💬 **Community / Discuss** — Post questions, share tips, comment, and like posts from fellow debuggers.
- 📅 **Daily Challenge** — A fresh timed challenge every day, with a live countdown to the next one.
- 🏅 **Profile & Badges** — Track your stats, earn badges, and submit your own community challenge uploads.
- 🛠️ **Dev Dashboard** — A moderation/publishing queue where approved challenge submissions become live challenges.
- 🌗 **Light / Dark Mode** — Full theme toggle across the entire app.
- 🔐 **Authentication** — Email/password sign-up & login, plus Google sign-in via Firebase Auth.
- ☁️ **Realtime Data** — Challenges, users, posts, and submissions are all backed by Firebase Firestore.

---

## 🖥️ Screenshots

> Add screenshots to `docs/images/` and update the paths below — see the **Images Needed** section for the full list.

| Landing Page | Dashboard | Challenge (Debug View) |
|---|---|---|
| ![Landing](docs/images/hero-landing.png) | ![Dashboard](docs/images/dashboard.png) | ![Challenge](docs/images/challenge-page.png) |

| Levels | Leaderboard | Community |
|---|---|---|
| ![Levels](docs/images/levels.png) | ![Leaderboard](docs/images/leaderboard.png) | ![Discuss](docs/images/discuss.png) |

---

## 🧰 Tech Stack

- **Frontend:** React (functional components + hooks)
- **Styling:** Custom CSS-in-JS / injected stylesheet (Nunito, Fredoka One, JetBrains Mono via Google Fonts)
- **Backend / Database:** Firebase Authentication + Cloud Firestore
- **Auth Providers:** Email/Password, Google (OAuth via `signInWithPopup`)

---

## 📁 Project Structure

```
debugg/
├── public/
├── src/
│   ├── App.jsx / App.js        # Main app — routing, state, all page components
│   ├── firebase.js             # Firebase config & initialization (auth, db)
│   ├── styles.css               # Base stylesheet import
│   └── ...
├── docs/
│   └── images/                  # README screenshots (see below)
├── .env.local                   # Firebase environment variables (not committed)
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- npm or yarn
- A [Firebase](https://firebase.google.com/) project (Firestore + Authentication enabled)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/debugg.git
cd debugg
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Firebase

Create a `src/firebase.js` file with your Firebase project config:

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

In the Firebase console, enable:
- **Authentication** → Email/Password and Google sign-in providers
- **Firestore Database** → with collections: `users`, `challenges`, `posts`, `submissions`

### 4. Run the app

```bash
npm start
# or
yarn start
```

The app will be available at `http://localhost:3000`.

---

## 🗺️ App Pages

| Page | Description |
|---|---|
| **Landing** | Marketing/hero page with feature highlights and stats |
| **Auth (Login/Signup)** | Email/password and Google authentication |
| **Dashboard** | Overview of available and filtered challenges |
| **Levels** | Language → topic → difficulty selection with unlockable levels |
| **Challenge Page** | Interactive debugging view — select buggy line, apply fix, run, submit |
| **Daily Challenge** | Timed daily challenge with countdown |
| **Leaderboard** | Global XP rankings |
| **Discuss** | Community feed — post, comment, like, groups |
| **Profile** | User stats, badges, and challenge submission form |
| **Dev Dashboard** | Review/approve/reject community submissions and publish new challenges |

---

## 🖼️ Images Needed

The README above references screenshots that should be captured from a running instance of the app and placed in `docs/images/`:

| File | Where to capture it |
|---|---|
| `docs/images/hero-landing.png` | The **Landing** page hero section |
| `docs/images/dashboard.png` | The **Dashboard** page with a few challenges visible |
| `docs/images/challenge-page.png` | An open **Challenge Page** mid-debug (a line selected) |
| `docs/images/levels.png` | The **Levels** page showing language/difficulty picker |
| `docs/images/leaderboard.png` | The **Leaderboard** page (global tab) |
| `docs/images/discuss.png` | The **Discuss** community feed with a couple of posts |
| `docs/images/profile.png` *(optional)* | The **Profile** page showing stats/badges |
| `docs/images/dev-dashboard.png` *(optional)* | The **Dev Dashboard** submission queue |

You can also add a logo/app icon at `docs/images/logo.png` if you'd like to use it at the top of the README instead of the hero screenshot.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for new challenges, bug fixes, or feature ideas.

## 📄 License

Add your chosen license here (e.g. MIT).
