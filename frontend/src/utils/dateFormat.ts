import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

/**
 * Format a timestamp as relative time (e.g., "2m ago", "1h ago")
 */
export function formatRelativeTime(timestamp: string | number | Date): string {
  return dayjs(timestamp).fromNow()
}

/**
 * Format a timestamp as a short date/time string (e.g., "2:45 PM", "Mar 3, 2:45 PM")
 */
export function formatShortTime(timestamp: string | number | Date): string {
  const date = dayjs(timestamp)
  const today = dayjs()

  if (date.isSame(today, 'day')) {
    return date.format('h:mm A')
  }
  return date.format('MMM D, h:mm A')
}
