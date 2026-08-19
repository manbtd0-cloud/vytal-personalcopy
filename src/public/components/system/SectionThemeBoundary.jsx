const ALLOWED_THEMES = new Set(['dark', 'light', 'coral', 'media-dark'])

export default function SectionThemeBoundary({
  theme = 'dark',
  as = 'section',
  className = '',
  children,
  ...props
}) {
  const Tag = as
  const resolvedTheme = ALLOWED_THEMES.has(theme) ? theme : 'dark'

  return (
    <Tag
      className={className}
      data-public-theme={resolvedTheme}
      {...props}
    >
      {children}
    </Tag>
  )
}
