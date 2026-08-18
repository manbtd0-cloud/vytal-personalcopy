export default function StatusChip({ status }) {
  const slug = status.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')
  return <span className={`status-chip status-chip--${slug}`}>{status}</span>
}
