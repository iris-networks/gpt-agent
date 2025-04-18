export default function Header() {
    const header = document.createElement('header');
    header.className = 'bg-white shadow-sm py-4 px-6';
    
    const title = document.createElement('h1');
    title.className = 'text-2xl font-bold text-gray-800 text-center';
    title.textContent = 'Pulsar - GUI Automation Agent';
    
    header.appendChild(title);
    return header;
}