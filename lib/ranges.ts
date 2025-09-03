import { PageRange } from './types'

/**
 * Parse a page range string into an array of PageRange objects
 * Examples: "1-3,5,8-10" -> [{start: 1, end: 3}, {start: 5, end: 5}, {start: 8, end: 10}]
 */
export function parsePageRanges(rangeString: string): PageRange[] {
  if (!rangeString.trim()) return []
  
  const ranges: PageRange[] = []
  const parts = rangeString.split(',').map(part => part.trim())
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(num => parseInt(num.trim(), 10))
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        ranges.push({ start, end })
      }
    } else {
      const page = parseInt(part, 10)
      if (!isNaN(page) && page > 0) {
        ranges.push({ start: page, end: page })
      }
    }
  }
  
  return ranges
}

/**
 * Convert PageRange array to a readable string
 */
export function rangesToString(ranges: PageRange[]): string {
  return ranges
    .map(range => range.start === range.end ? range.start.toString() : `${range.start}-${range.end}`)
    .join(', ')
}

/**
 * Get all page numbers from a range array
 */
export function getPageNumbers(ranges: PageRange[]): number[] {
  const pages: number[] = []
  
  for (const range of ranges) {
    for (let i = range.start; i <= range.end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }
  }
  
  return pages.sort((a, b) => a - b)
}

/**
 * Generate common range presets
 */
export function getRangePresets(totalPages: number): { label: string; ranges: PageRange[] }[] {
  return [
    {
      label: 'First half',
      ranges: [{ start: 1, end: Math.ceil(totalPages / 2) }]
    },
    {
      label: 'Second half',
      ranges: [{ start: Math.ceil(totalPages / 2) + 1, end: totalPages }]
    },
    {
      label: 'Odd pages',
      ranges: Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => ({
        start: i * 2 + 1,
        end: i * 2 + 1
      }))
    },
    {
      label: 'Even pages',
      ranges: Array.from({ length: Math.floor(totalPages / 2) }, (_, i) => ({
        start: (i + 1) * 2,
        end: (i + 1) * 2
      }))
    }
  ]
}
