/**
 * Accessibility Utilities
 * Tools for improving application accessibility (WCAG 2.1 AA compliance)
 */

// Interface voor accessibility opties
export interface AccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  textSpacing: boolean;
}

// Default accessibility opties
const defaultOptions: AccessibilityOptions = {
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  textSpacing: false,
};

// Lokale opslag key
const STORAGE_KEY = 'ckw-accessibility-options';

/**
 * Haalt accessibility opties op uit lokale opslag
 * @returns Huidige accessibility opties
 */
export function getAccessibilityOptions(): AccessibilityOptions {
  if (typeof window === 'undefined') {
    return defaultOptions;
  }
  
  try {
    const storedOptions = localStorage.getItem(STORAGE_KEY);
    if (storedOptions) {
      return JSON.parse(storedOptions);
    }
  } catch (error) {
    console.error('Fout bij ophalen accessibility opties:', error);
  }
  
  return defaultOptions;
}

/**
 * Slaat accessibility opties op in lokale opslag
 * @param options Nieuwe accessibility opties
 */
export function saveAccessibilityOptions(options: Partial<AccessibilityOptions>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const currentOptions = getAccessibilityOptions();
    const updatedOptions = { ...currentOptions, ...options };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOptions));
    
    // Pas de opties direct toe
    applyAccessibilityOptions(updatedOptions);
  } catch (error) {
    console.error('Fout bij opslaan accessibility opties:', error);
  }
}

/**
 * Past accessibility opties toe op de huidige pagina
 * @param options Accessibility opties om toe te passen
 */
export function applyAccessibilityOptions(options: AccessibilityOptions): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const html = document.documentElement;
  
  // High contrast mode
  if (options.highContrast) {
    html.classList.add('high-contrast');
  } else {
    html.classList.remove('high-contrast');
  }
  
  // Large text
  if (options.largeText) {
    html.classList.add('large-text');
  } else {
    html.classList.remove('large-text');
  }
  
  // Reduce motion
  if (options.reduceMotion) {
    html.classList.add('reduce-motion');
  } else {
    html.classList.remove('reduce-motion');
  }
  
  // Text spacing
  if (options.textSpacing) {
    html.classList.add('text-spacing');
  } else {
    html.classList.remove('text-spacing');
  }
  
  // Screen reader optimizations
  if (options.screenReader) {
    html.classList.add('sr-optimized');
  } else {
    html.classList.remove('sr-optimized');
  }
  
  // Keyboard navigation
  if (options.keyboardNavigation) {
    html.classList.add('keyboard-nav');
    enableKeyboardNavigation();
  } else {
    html.classList.remove('keyboard-nav');
    disableKeyboardNavigation();
  }
}

/**
 * Detecteert gebruikersvoorkeuren voor toegankelijkheid
 * @returns Gedetecteerde accessibility opties
 */
export function detectAccessibilityPreferences(): Partial<AccessibilityOptions> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const options: Partial<AccessibilityOptions> = {};
  
  // Detecteer voorkeur voor hoog contrast
  if (window.matchMedia('(prefers-contrast: high)').matches) {
    options.highContrast = true;
  }
  
  // Detecteer voorkeur voor grotere tekst
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    options.reduceMotion = true;
  }
  
  return options;
}

/**
 * Initialiseert accessibility opties bij het laden van de applicatie
 */
export function initializeAccessibility(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Haal opgeslagen opties op
  const storedOptions = getAccessibilityOptions();
  
  // Detecteer gebruikersvoorkeuren
  const detectedOptions = detectAccessibilityPreferences();
  
  // Combineer opgeslagen opties met gedetecteerde voorkeuren
  const combinedOptions = { ...storedOptions, ...detectedOptions };
  
  // Pas de opties toe
  applyAccessibilityOptions(combinedOptions);
  
  // Sla de gecombineerde opties op
  saveAccessibilityOptions(combinedOptions);
}

/**
 * Schakelt keyboard navigatie in
 */
function enableKeyboardNavigation(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Voeg focus styles toe
  const style = document.createElement('style');
  style.id = 'keyboard-nav-styles';
  style.textContent = `
    :focus {
      outline: 2px solid #0070f3 !important;
      outline-offset: 2px !important;
    }
    
    .focus-visible:focus {
      outline: 2px solid #0070f3 !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(style);
  
  // Voeg event listener toe voor tab navigatie detectie
  document.addEventListener('keydown', handleTabKey);
}

/**
 * Schakelt keyboard navigatie uit
 */
function disableKeyboardNavigation(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Verwijder focus styles
  const style = document.getElementById('keyboard-nav-styles');
  if (style) {
    style.remove();
  }
  
  // Verwijder event listener
  document.removeEventListener('keydown', handleTabKey);
}

/**
 * Handelt tab toets navigatie af
 * @param event Keyboard event
 */
function handleTabKey(event: KeyboardEvent): void {
  if (event.key === 'Tab') {
    document.documentElement.classList.add('keyboard-user');
  }
}

/**
 * Voegt skip links toe aan de pagina voor toetsenbord gebruikers
 * @param mainContentId ID van de main content container
 */
export function addSkipLinks(mainContentId: string = 'main-content'): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Controleer of skip link al bestaat
  if (document.getElementById('skip-link')) {
    return;
  }
  
  // Maak skip link element
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-link';
  skipLink.href = `#${mainContentId}`;
  skipLink.textContent = 'Ga naar hoofdinhoud';
  skipLink.className = 'skip-link';
  
  // Voeg CSS toe
  const style = document.createElement('style');
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #0070f3;
      color: white;
      padding: 8px;
      z-index: 100;
      transition: top 0.2s;
    }
    
    .skip-link:focus {
      top: 0;
    }
  `;
  
  // Voeg elementen toe aan de pagina
  document.head.appendChild(style);
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Controleert of een element toegankelijk is voor screenreaders
 * @param element HTML element om te controleren
 * @returns Object met toegankelijkheidsproblemen
 */
export function checkAccessibility(element: HTMLElement): {
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Controleer alt tekst voor afbeeldingen
  if (element.tagName === 'IMG') {
    const imgElement = element as HTMLImageElement;
    if (!imgElement.alt || imgElement.alt === '') {
      issues.push('Afbeelding mist alt tekst');
    }
  }
  
  // Controleer aria-label voor interactieve elementen zonder tekst
  if ((element.tagName === 'BUTTON' || element.tagName === 'A') && 
      element.textContent?.trim() === '' && 
      !element.getAttribute('aria-label')) {
    issues.push(`${element.tagName} element mist aria-label of tekst inhoud`);
  }
  
  // Controleer contrast ratio (vereenvoudigd)
  const style = window.getComputedStyle(element);
  const hasText = (element.textContent?.trim().length ?? 0) > 0;
  
  if (hasText && style.color === style.backgroundColor) {
    issues.push('Tekstkleur is gelijk aan achtergrondkleur');
  }
  
  // Controleer heading volgorde
  if (element.tagName.match(/^H\d$/)) {
    const level = parseInt(element.tagName.substring(1));
    const parentHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (level > 1) {
      let previousHeadingFound = false;
      
      for (const heading of parentHeadings) {
        const headingLevel = parseInt(heading.tagName.substring(1));
        
        if (heading === element) {
          if (!previousHeadingFound) {
            warnings.push(`Heading niveau ${level} zonder voorgaande heading niveau ${level - 1}`);
          }
          break;
        }
        
        if (headingLevel === level - 1) {
          previousHeadingFound = true;
        }
      }
    }
  }
  
  return { issues, warnings };
}
