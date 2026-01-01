import { describe, it, expect } from 'vitest'
import { getQuestionTypeByCode, getQuestionTypesByCategory, validateQuestionDefinitions, ALL_QUESTION_TYPES } from '../lib/constants/pte-questions'
import ICON_MAP from '../lib/constants/icons'

describe('PTE question utilities', () => {
    it('finds question by code', () => {
        const q = getQuestionTypeByCode('read_aloud')
        expect(q).toBeDefined()
        expect(q?.code).toBe('read_aloud')
    })

    it('returns questions for a category', () => {
        const speaking = getQuestionTypesByCategory('speaking' as any)
        expect(Array.isArray(speaking)).toBe(true)
        expect(speaking.length).toBeGreaterThan(0)
        expect(speaking.every(q => q.category === 'speaking')).toBe(true)
    })

    it('has valid icons present in ICON_MAP', () => {
        const all = Object.values(ALL_QUESTION_TYPES) as any[]
        all.forEach(q => {
            expect(Object.prototype.hasOwnProperty.call(ICON_MAP, q.icon)).toBe(true)
        })
    })

    it('validateQuestionDefinitions returns no errors', () => {
        const errors = validateQuestionDefinitions()
        expect(errors.length).toBe(0)
    })
})
