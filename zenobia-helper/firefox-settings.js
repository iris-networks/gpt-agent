// Firefox user preferences for better readability and reduced eye strain

// Set the default font size to larger value
pref("font.size.variable.x-western", 18);
pref("font.size.monospace.x-western", 16);

// Enable light mode by default
pref("browser.theme.content-theme", 1);
pref("browser.in-content.dark-mode", false);
pref("ui.systemUsesDarkTheme", 0);

// Use system settings for fonts
pref("font.name.serif.x-western", "DejaVu Serif");
pref("font.name.sans-serif.x-western", "DejaVu Sans");
pref("font.name.monospace.x-western", "DejaVu Sans Mono");

// Reduce flickering
pref("browser.preferences.instantApply", true);

// Light mode color settings
pref("browser.display.background_color", "#FFFFFF");
pref("browser.display.foreground_color", "#000000");
pref("browser.display.document_color_use", 1); // 0=Always, 1=Auto, 2=Never

// Reader mode settings
pref("reader.color_scheme", "light");
pref("reader.font_size", 7); // Larger size
pref("reader.font_type", "sans-serif");

// Reduce animations for less eye strain
pref("ui.prefersReducedMotion", 1);

// Force enable light mode for websites when possible
pref("layout.css.prefers-color-scheme.content-override", 1);