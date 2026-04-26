/**
 * JAHIZIA Logo Component — Single source of truth for brand logo display.
 *
 * Uses direct img tags referencing SVG assets in /brand/.
 * Automatically inverts based on theme:
 * - Dark theme → white logo
 * - Light theme → navy logo (#1a2b56)
 *
 * NOTE: This component does NOT import AppContext to avoid circular dependency
 * issues. It reads the theme from the DOM data-theme attribute instead.
 *
 * @param {'full'|'mark'} variant  — 'full' = logo + wordmark, 'mark' = icon only
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|number} size — preset or pixel height
 * @param {'auto'|'navy'|'white'|'mono'} color — 'auto' detects theme
 * @param {string} className — additional CSS classes
 */
const Logo = ({
  variant = 'mark',
  size = 'md',
  color = 'auto',
  className = '',
  ...rest
}) => {
  // Detect theme from DOM attribute (set by AppContext) to avoid circular deps
  let resolvedColor = color;
  if (color === 'auto') {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    resolvedColor = theme === 'dark' ? 'white' : 'navy';
  }

  // Asset path map
  const assetMap = {
    'full-navy': '/brand/jahizia-full-navy.svg',
    'full-white': '/brand/jahizia-full-white.svg',
    'mark-navy': '/brand/jahizia-mark-navy.svg',
    'mark-white': '/brand/jahizia-mark-white.svg',
    'mark-mono': '/brand/jahizia-mark-mono.svg',
    'full-mono': '/brand/jahizia-full-navy.svg',
  };

  const src = assetMap[`${variant}-${resolvedColor}`] || assetMap['mark-navy'];

  // Size mapping (height in px — width auto-scales)
  const sizeMap = {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
    '2xl': 96,
  };

  const heightPx = typeof size === 'number' ? size : (sizeMap[size] || 32);

  return (
    <img
      src={src}
      alt="JAHIZIA — جاهزية"
      height={heightPx}
      style={{ height: `${heightPx}px`, width: 'auto' }}
      className={`jahizia-logo ${className}`}
      draggable={false}
      {...rest}
    />
  );
};

export default Logo;
