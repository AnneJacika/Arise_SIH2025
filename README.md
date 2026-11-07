# Arise 🚀  
### Gamified Learning Platform for Rural Education  
**Problem Statement ID:** SIH25048 | **Theme:** Smart Education  
**Sponsored by:** Government of Odisha 🏛️  

## 📖 Overview  
**Arise** is a robust **Single Page Application (SPA)** designed to revolutionize STEM learning in rural areas. Addressing the challenge of limited internet connectivity, Arise leverages **Browser Local Storage** and **IndexedDB** to provide a fully functional **offline-first** educational platform.  

Built for the **Smart India Hackathon 2025**, this solution bridges the digital divide by enabling students to access quizzes, virtual labs, and lessons without needing a continuous internet connection.

---

<details open>
<summary><b>📸 Project Gallery (Click to collapse/expand)</b></summary>

<br>

<table align="center">
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/98e2dde5-31fb-41ef-b00c-c2a4fa84593d" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/6727c830-154b-4e95-90e3-9c2535817b68" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/8c198d7f-f4fd-4887-8343-caf28f0e6420" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/ea837425-645b-4074-b369-476540bbbe68" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/9d3d4558-8241-4698-88e2-e7c3a9154e4c" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/efce7f7e-5c7a-40ee-ab03-8f7a201c10fb" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/4e4d881d-d364-4522-812c-d8d1995ab5cc" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/bb856b54-79b9-481c-92e0-50dd43407747" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/6d7cf161-e4c5-4dc7-b66b-8cf336f4420f" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/c027bcf7-967d-465c-b592-d1d8c77e9bb3" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/644df4a7-26f7-4cd5-a6af-d88f7c02d748" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/bcbfab4d-4721-4b6d-b3ea-778ab7b8029e" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/f4ade7cd-585c-4b55-a5e4-27845c86b422" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/a6b71593-c836-4be5-861e-7a034a6562b5" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/6b11a923-fdaa-4c30-8cc8-c1255205b4a6" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/7559c7a0-842e-43be-b778-a4356fe376ec" width="100%"></td>
  </tr>
  <tr>
    <td align="center"><img src="https://github.com/user-attachments/assets/6a62db52-693a-4374-8688-22c532cc5d1a" width="100%"></td>
    <td align="center"><img src="https://github.com/user-attachments/assets/48dc879d-0d3b-49ed-b853-227fcd7d1908" width="100%"></td>
  </tr>
</table>

</details>
---

## ✨ Key Features  

### 🌍 **True Offline Capability (SPA)**  
- **Offline-First Architecture**: Built as a Single Page Application (SPA) where resources are cached, allowing users to navigate and interact seamlesssly without internet.
- **Local Storage & Dexie.js**: All progress, quiz scores, and lab states are saved locally (`localStorage` & `IndexedDB`) and synchronized when the connection is restored.
- **Smart Content Sync**: Unique capability to export app data (including games and updates) for manual distribution, ensuring users can update content even without direct internet access.
- **Multilingual Support**: Fully localized interface (including **Odia**) using **i18next** to break language barriers.  

### 🔬 **Virtual STEM Labs**  
- Interactive simulations for **Physics**, **Chemistry**, and **Biology**.  
- hands-on learning experiences through digital playgrounds (`Playground.jsx`).  

### 🎮 **Gamification & Engagement**  
- **Leaderboards**: Real-time ranking to foster healthy competition (`LeaderboardPage.jsx`).  
- **Rewards System**: Engaging UI with animations (**Framer Motion**, **Confetti**) to celebrate milestones.  

### 📊 **Smart Assessment & Analytics**  
- **Hybrid Quizzes**: Support for both Online and Offline assessments using seamless synchronization.  
- **Comprehensive Dashboards**:  
  - 🎓 **Student Dashboard**: Track progress, access labs, and view results.  
  - 👨‍🏫 **Staff Dashboard**: Manage quizzes, view class analytics, and monitor student performance.  
  - 🏫 **School Dashboard**: Administrative oversight and high-level metrics.  

### 🤝 **Community & Support**  
- **Q&A Corner**: A dedicated space for students to ask questions and clarify doubts.  

---

## 🛠️ Tech Stack  

| Category | Technologies |  
|----------|--------------|  
| **Frontend** | React 19, Vite 7, Tailwind CSS 4 |  
| **Storage & Backend** | Firebase (Auth/Sync), Dexie.js (Offline DB) |  
| **Interactivity** | Framer Motion, React Confetti, Pixi.js |  
| **Languages** | i18next (Internationalization) |  
| **Visuals** | Recharts (Analytics), Lucide React (Icons) |  
| **Real-time** | Socket.io-client |  

---

## 🚀 Getting Started  

Follow these steps to set up the project locally.  

### Prerequisites  
- Node.js (v18 or higher)  
- npm or yarn  

### Installation  

1. **Clone the repository**  
   ```bash  
   git clone https://github.com/Itz-mehanth/Arise_SIH2025.git  
   cd Arise
   ```  

2. **Install dependencies**  
   ```bash  
   npm install  
   ```  

3. **Set up Environment Variables**  
   Create a `.env` file in the root directory and add your Firebase/Project configurations:  
   ```env  
   VITE_FIREBASE_API_KEY=your_api_key  
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com  
   # Add other necessary keys  
   ```  

4. **Run the development server**  
   ```bash  
   npm run dev  
   ```  

5. **Open in Browser**  
   Visit `http://localhost:5173` to view the application.  

---

## 🔮 Future Scope  
- AI-driven personalized learning paths.  
- Integration with hardware prompts for physical science experiments.  
- Expansion to more regional languages.  

---

Made with ❤️ for **SIH 2025** | *Empowering Rural Education*  
