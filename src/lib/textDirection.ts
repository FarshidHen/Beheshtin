/**
 * Utility functions for detecting text direction based on content
 */

/**
 * Detects if text contains Persian/Farsi characters
 * @param text - The text to analyze
 * @returns true if text contains Persian characters, false otherwise
 */
export function containsPersianCharacters(text: string): boolean {
  if (!text) return false
  
  // Persian/Farsi Unicode ranges:
  // 0600-06FF: Arabic (includes Persian)
  // 0750-077F: Arabic Supplement
  // FB50-FDFF: Arabic Presentation Forms-A
  // FE70-FEFF: Arabic Presentation Forms-B
  const persianRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/
  
  return persianRegex.test(text)
}

/**
 * Determines the text direction based on content
 * @param text - The text to analyze
 * @returns 'rtl' for Persian/Arabic text, 'ltr' for English/Latin text
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  return containsPersianCharacters(text) ? 'rtl' : 'ltr'
}

/**
 * Returns appropriate CSS classes for text direction
 * @param text - The text to analyze
 * @returns CSS classes string for text direction
 */
export function getTextDirectionClass(text: string): string {
  const direction = getTextDirection(text)
  return direction === 'rtl' ? 'text-right dir-rtl' : 'text-left dir-ltr'
}

/**
 * Returns inline style object for text direction
 * @param text - The text to analyze
 * @returns Style object with direction property
 */
export function getTextDirectionStyle(text: string): { direction: 'rtl' | 'ltr'; textAlign: 'right' | 'left' } {
  const direction = getTextDirection(text)
  return {
    direction,
    textAlign: direction === 'rtl' ? 'right' : 'left'
  }
}

/**
 * Returns container style object for RTL content with proper spacing
 * @param text - The text to analyze
 * @returns Style object with direction and padding adjustments
 */
export function getTextDirectionContainerStyle(text: string): { 
  direction: 'rtl' | 'ltr'; 
  textAlign: 'right' | 'left';
  paddingRight?: string;
  paddingLeft?: string;
} {
  const direction = getTextDirection(text)
  if (direction === 'rtl') {
    return {
      direction: 'rtl',
      textAlign: 'right',
      paddingRight: '0.5rem', // Reduced padding for RTL
      paddingLeft: '1rem'     // Normal padding on the left
    }
  } else {
    return {
      direction: 'ltr',
      textAlign: 'left',
      paddingLeft: '1rem',    // Normal padding for LTR
      paddingRight: '0.5rem'
    }
  }
}
