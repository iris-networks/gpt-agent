import InputSection from './InputSection.js';
import OutputSection from './OutputSection.js';

export default function MainContent() {
    const main = document.createElement('main');
    main.className = 'container mx-auto px-4 py-8 max-w-6xl';
    
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-6';
    
    container.appendChild(InputSection());
    container.appendChild(OutputSection());
    
    main.appendChild(container);
    return main;
}