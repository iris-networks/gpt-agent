import Header from './Header.js';
import MainContent from './MainContent.js';
import SettingsModal from './SettingsModal.js';

export default function App() {
    const app = document.createElement('div');
    app.className = 'min-h-screen bg-gray-100';
    
    app.appendChild(Header());
    app.appendChild(MainContent());
    app.appendChild(SettingsModal());
    
    return app;
}