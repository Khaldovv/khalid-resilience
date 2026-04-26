/**
 * JAHIZIA Logo Component — Single source of truth for brand logo display.
 *
 * APPROACH: Always loads the NAVY SVG source files and uses CSS filter
 * inversion (`brightness(0) invert(1)`) to render white on dark themes.
 * This avoids all SVG white-background bugs since only one set of SVGs
 * (navy, with transparent background) is ever used at runtime.
 *
 * - Dark theme (default) → navy SVG + CSS filter → appears WHITE
 * - Light theme → navy SVG rendered as-is → appears NAVY
 * - color="white" → forced CSS filter inversion regardless of theme
 * - color="navy" → no filter, always navy
 *
 * NOTE: Does NOT import AppContext to avoid circular dependency issues.
 * Reads theme from DOM data-theme attribute instead.
 *
 * @param {'full'|'mark'} variant  — 'full' = logo + wordmark, 'mark' = icon only
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|number} size — preset or pixel height
 * @param {'auto'|'navy'|'white'} color — 'auto' detects theme; 'white'/'navy' forces
 * @param {string} className — additional CSS classes
 */
const Logo = ({
  variant = 'mark',
  size = 'md',
  color = 'auto',
  className = '',
  ...rest
}) => {
  // Always use the navy (transparent background) SVG as the source
  const src = `/brand/jahizia-${variant}-navy.svg`;

  // Determine if we need to invert to white
  let shouldInvert = false;
  if (color === 'white') {
    shouldInvert = true;
  } else if (color === 'auto') {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    shouldInvert = theme === 'dark';
  }
  // color === 'navy' → shouldInvert stays false

  // Size mapping (height in px — width auto-scales via CSS)
  const sizeMap = {
    xs: 24,
    sm: 36,
    md: 48,
    lg: 64,
    xl: 96,
    '2xl': 128,
    '3xl': 160,
  };

  const heightPx = typeof size === 'number' ? size : (sizeMap[size] || 48);

  // CSS filter: brightness(0) turns all colors to black, invert(1) flips to white
  const filterStyle = shouldInvert
    ? { filter: 'brightness(0) invert(1)' }
    : {};

  return (
    <img
      src={src}
      alt="JAHIZIA — جاهزية"
      style={{
        height: `${heightPx}px`,
        width: 'auto',
        display: 'inline-block',
        objectFit: 'contain',
        ...filterStyle,
      }}
      className={`jahizia-logo jahizia-logo--${variant} ${className}`}
      draggable={false}
      {...rest}
    />
  );
};

export default Logo;
