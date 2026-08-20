const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function boundedPageSize(value, fallback = 25, maximum = 100) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return Math.min(parsed, maximum)
}

export function createCursor(row, timestampField) {
  if (!row?.id || !row?.[timestampField]) return null
  return { timestamp: row[timestampField], id: row.id }
}

export function applyDescendingCursor(query, timestampField, cursor) {
  if (!cursor) return query
  const timestamp = new Date(cursor.timestamp)
  if (!UUID_PATTERN.test(String(cursor.id)) || Number.isNaN(timestamp.getTime())) {
    throw new Error('Invalid pagination cursor.')
  }
  const isoTimestamp = timestamp.toISOString()
  return query.or(
    `${timestampField}.lt."${isoTimestamp}",and(${timestampField}.eq."${isoTimestamp}",id.lt.${cursor.id})`,
  )
}

export function pageResult(rows, limit, timestampField) {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  return {
    items,
    hasMore,
    nextCursor: hasMore ? createCursor(items[items.length - 1], timestampField) : null,
  }
}
