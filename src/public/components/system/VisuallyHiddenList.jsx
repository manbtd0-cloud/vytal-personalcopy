export default function VisuallyHiddenList({ items, ariaLabel, renderItem, getKey }) {
  return (
    <ul className="visually-hidden-list" aria-label={ariaLabel}>
      {items.map((item, index) => (
        <li key={getKey ? getKey(item, index) : item?.id ?? item?.slug ?? `${index}`}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  )
}
