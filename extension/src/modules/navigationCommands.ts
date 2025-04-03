import { NavigateCommand } from "./commandTypes";

/**
 * Navigate to a URL
 */
export async function handleNavigate(command: NavigateCommand): Promise<string> {
  const { url } = command;
  
  // Check if URL is valid
  let validUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    validUrl = 'https://' + url;
  }
  
  // Send message to background script to handle navigation
  chrome.runtime.sendMessage({
    action: 'navigate',
    url: validUrl
  });
  
  return `Navigating to ${validUrl}`;
}

/**
 * Navigate back in browser history
 */
export async function handleBack(): Promise<string> {
  window.history.back();
  return 'Navigated back';
}

/**
 * Navigate forward in browser history
 */
export async function handleForward(): Promise<string> {
  window.history.forward();
  return 'Navigated forward';
}

/**
 * Reload the current page
 */
export async function handleReload(): Promise<string> {
  window.location.reload();
  return 'Reloaded page';
}