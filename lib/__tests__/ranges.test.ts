import { parsePageRanges, rangesToString, getPageNumbers } from '../ranges'

describe('Page Range Utilities', () => {
  describe('parsePageRanges', () => {
    it('should parse simple ranges', () => {
      expect(parsePageRanges('1-3')).toEqual([{ start: 1, end: 3 }])
      expect(parsePageRanges('5')).toEqual([{ start: 5, end: 5 }])
    })

    it('should parse multiple ranges', () => {
      expect(parsePageRanges('1-3,5,8-10')).toEqual([
        { start: 1, end: 3 },
        { start: 5, end: 5 },
        { start: 8, end: 10 },
      ])
    })

    it('should handle empty input', () => {
      expect(parsePageRanges('')).toEqual([])
      expect(parsePageRanges('   ')).toEqual([])
    })

    it('should filter invalid ranges', () => {
      expect(parsePageRanges('1-3,invalid,5')).toEqual([
        { start: 1, end: 3 },
        { start: 5, end: 5 },
      ])
    })

    it('should handle ranges where start > end', () => {
      expect(parsePageRanges('3-1')).toEqual([])
    })
  })

  describe('rangesToString', () => {
    it('should convert ranges to string', () => {
      expect(rangesToString([{ start: 1, end: 3 }, { start: 5, end: 5 }])).toBe('1-3,5')
    })

    it('should handle empty array', () => {
      expect(rangesToString([])).toBe('')
    })
  })

  describe('getPageNumbers', () => {
    it('should get all page numbers from ranges', () => {
      expect(getPageNumbers([{ start: 1, end: 3 }, { start: 5, end: 5 }])).toEqual([1, 2, 3, 5])
    })

    it('should remove duplicates', () => {
      expect(getPageNumbers([{ start: 1, end: 3 }, { start: 2, end: 4 }])).toEqual([1, 2, 3, 4])
    })

    it('should sort page numbers', () => {
      expect(getPageNumbers([{ start: 5, end: 3 }, { start: 1, end: 2 }])).toEqual([1, 2, 3, 4, 5])
    })
  })
})
