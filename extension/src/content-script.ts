
// Main content script for the Zenobia agent
import { initUI } from './modules/ui';
import { initMessageListeners } from './modules/messaging';

initUI();
initMessageListeners();

