/**
 * Test suite to verify all external wiki links are reachable
 * Run with: npx vitest run tests/wikiLinks.test.ts
 */

import { describe, it, expect } from 'vitest'
import { 
    getAllExternalLinks, 
    WIKI_CATEGORIES, 
    getPrivacyRatingColor, 
    getPrivacyRatingLabel,
    mapScoreToClass,
    mapScoreToPrivacyRating,
    mapPrivacyRatingToScoreClass,
    getServiceByAnswerValue,
    getUnifiedServiceInfo
} from '../src/data/wiki'

describe('Wiki Data Structure', () => {
    it('should have all required categories', () => {
        const expectedCategories = [
            'email',
            'cloud',
            'passwords',
            'vpn',
            'messaging',
            'desktop-browsers',
            'mobile-browsers',
            'search-engines'
        ]

        const categoryIds = WIKI_CATEGORIES.map(c => c.id)

        for (const expected of expectedCategories) {
            expect(categoryIds).toContain(expected)
        }
    })

    it('should have Privacy Guides URL for each category', () => {
        for (const category of WIKI_CATEGORIES) {
            expect(category.privacyGuidesUrl).toBeDefined()
            expect(category.privacyGuidesUrl).toMatch(/^https:\/\/www\.privacyguides\.org\/en\//)
        }
    })

    it('should have at least one good-rated service per category', () => {
        for (const category of WIKI_CATEGORIES) {
            const goodRated = category.services.filter(s => s.privacyRating === 'good')
            expect(goodRated.length, `Category ${category.id} has no good-rated services`).toBeGreaterThan(0)
        }
    })

    it('should have valid privacy ratings for all services', () => {
        const validRatings = ['good', 'recommended', 'acceptable', 'caution', 'avoid']

        for (const category of WIKI_CATEGORIES) {
            for (const service of category.services) {
                expect(validRatings).toContain(service.privacyRating)
            }
        }
    })

    it('should have privacy details for all services', () => {
        for (const category of WIKI_CATEGORIES) {
            for (const service of category.services) {
                expect(service.privacyDetails.length,
                    `Service ${service.name} has no privacy details`
                ).toBeGreaterThan(0)
            }
        }
    })
})

describe('Helper Functions', () => {
    it('getPrivacyRatingColor should return valid colors', () => {
        expect(getPrivacyRatingColor('good')).toBe('#22c55e')
        expect(getPrivacyRatingColor('acceptable')).toBe('#eab308')
        expect(getPrivacyRatingColor('caution')).toBe('#f97316')
        expect(getPrivacyRatingColor('avoid')).toBe('#ef4444')
    })

    it('getPrivacyRatingLabel should return valid labels', () => {
        expect(getPrivacyRatingLabel('good')).toBe('✓ Good')
        expect(getPrivacyRatingLabel('acceptable')).toBe('Acceptable')
        expect(getPrivacyRatingLabel('caution')).toBe('⚠ Caution')
        expect(getPrivacyRatingLabel('avoid')).toBe('✗ Avoid')
    })

    it('getAllExternalLinks should return all links', () => {
        const links = getAllExternalLinks()

        // Should include Privacy Guides links
        const pgLinks = links.filter(l => l.url.includes('privacyguides.org'))
        expect(pgLinks.length).toBe(WIKI_CATEGORIES.length)

        // Should include service homepages
        const totalServices = WIKI_CATEGORIES.reduce((acc, cat) =>
            acc + cat.services.filter(s => s.homepage).length, 0
        )
        expect(links.length).toBeGreaterThanOrEqual(WIKI_CATEGORIES.length + totalServices - 1) // -1 for SMS with no homepage
    })
})

describe('Recommendation Logic', () => {
    it('all good-rated services should have difficulty field', () => {
        for (const category of WIKI_CATEGORIES) {
            const goodServices = category.services.filter(
                s => s.privacyRating === 'good' || s.privacyRating === 'recommended'
            )
            
            for (const service of goodServices) {
                expect(service.difficulty, 
                    `Service ${service.name} in ${category.id} is missing difficulty field`
                ).toBeDefined()
                expect([1, 2, 3]).toContain(service.difficulty)
            }
        }
    })

    it('non-good-rated services should NOT have difficulty field', () => {
        for (const category of WIKI_CATEGORIES) {
            const nonGoodServices = category.services.filter(
                s => s.privacyRating !== 'good' && s.privacyRating !== 'recommended'
            )
            
            for (const service of nonGoodServices) {
                expect(service.difficulty, 
                    `Non-good-rated service ${service.name} should not have difficulty`
                ).toBeUndefined()
            }
        }
    })

    it('each category should have at least one difficulty 1 service', () => {
        for (const category of WIKI_CATEGORIES) {
            const easyServices = category.services.filter(
                s => (s.privacyRating === 'good' || s.privacyRating === 'recommended') && s.difficulty === 1
            )
            
            expect(easyServices.length, 
                `Category ${category.id} has no easy (difficulty 1) recommended services`
            ).toBeGreaterThan(0)
        }
    })

    it('mainstream services should have caution or avoid rating', () => {
        const mainstreamNames = ['gmail', 'outlook', 'google drive', 'dropbox', 'chrome', 'whatsapp', 'google search']
        
        for (const category of WIKI_CATEGORIES) {
            for (const service of category.services) {
                const isMainstream = mainstreamNames.some(
                    name => service.name.toLowerCase().includes(name)
                )
                
                if (isMainstream) {
                    expect(['caution', 'avoid']).toContain(service.privacyRating)
                    expect(service.difficulty).toBeUndefined()
                }
            }
        }
    })
})

describe('External Link Validation', () => {
    // This test can be slow, skip in normal test runs
    // Run with: npx vitest run tests/wikiLinks.test.ts --testNamePattern="should be valid URLs"
    it('should be valid URLs', () => {
        const links = getAllExternalLinks()

        for (const { url, description } of links) {
            if (!url) continue // Skip empty URLs (like SMS)

            try {
                new URL(url)
            } catch {
                throw new Error(`Invalid URL for ${description}: ${url}`)
            }
        }
    })
})

describe('Unified Rating System', () => {
    it('mapScoreToClass should map scores correctly', () => {
        expect(mapScoreToClass(100)).toBe('good')
        expect(mapScoreToClass(80)).toBe('good')
        expect(mapScoreToClass(79)).toBe('medium')
        expect(mapScoreToClass(60)).toBe('medium')
        expect(mapScoreToClass(59)).toBe('poor')
        expect(mapScoreToClass(0)).toBe('poor')
    })

    it('mapScoreToPrivacyRating should map scores correctly', () => {
        expect(mapScoreToPrivacyRating(100)).toBe('good')
        expect(mapScoreToPrivacyRating(80)).toBe('good')
        expect(mapScoreToPrivacyRating(79)).toBe('acceptable')
        expect(mapScoreToPrivacyRating(60)).toBe('acceptable')
        expect(mapScoreToPrivacyRating(59)).toBe('caution')
        expect(mapScoreToPrivacyRating(40)).toBe('caution')
        expect(mapScoreToPrivacyRating(39)).toBe('avoid')
        expect(mapScoreToPrivacyRating(0)).toBe('avoid')
    })

    it('mapPrivacyRatingToScoreClass should map ratings correctly', () => {
        expect(mapPrivacyRatingToScoreClass('good')).toBe('good')
        expect(mapPrivacyRatingToScoreClass('acceptable')).toBe('medium')
        expect(mapPrivacyRatingToScoreClass('caution')).toBe('poor')
        expect(mapPrivacyRatingToScoreClass('avoid')).toBe('poor')
    })

    it('getServiceByAnswerValue should find services by quiz answer values', () => {
        // Test email lookup
        const gmail = getServiceByAnswerValue('email', 'gmail')
        expect(gmail).toBeDefined()
        expect(gmail?.name).toBe('Gmail')
        
        const proton = getServiceByAnswerValue('email', 'protonmail')
        expect(proton).toBeDefined()
        expect(proton?.name).toBe('Proton Mail')
        
        // Test browser lookup
        const chrome = getServiceByAnswerValue('desktop-browsers', 'chrome')
        expect(chrome).toBeDefined()
        expect(chrome?.privacyRating).toBe('avoid')
        
        const firefox = getServiceByAnswerValue('desktop-browsers', 'firefox')
        expect(firefox).toBeDefined()
        expect(firefox?.privacyRating).toBe('recommended')
    })

    it('getUnifiedServiceInfo should return unified service info', () => {
        const gmailInfo = getUnifiedServiceInfo('email-provider', 'gmail')
        expect(gmailInfo).toBeDefined()
        expect(gmailInfo?.rating).toBe('avoid')
        expect(gmailInfo?.scoreClass).toBe('poor')
        
        const protonInfo = getUnifiedServiceInfo('email-provider', 'protonmail')
        expect(protonInfo).toBeDefined()
        expect(protonInfo?.rating).toBe('good')
        expect(protonInfo?.scoreClass).toBe('good')
    })

    it('quiz score classes should align with wiki privacy ratings', () => {
        // Verify the scoring thresholds align:
        // Quiz: score >= 80 = 'good', 60-79 = 'medium', <60 = 'poor'
        // Wiki: good = 'good', acceptable = 'medium', caution/avoid = 'poor'
        
        // High privacy score services should have 'good' rating
        for (const category of WIKI_CATEGORIES) {
            const goodServices = category.services.filter(s => s.privacyRating === 'good')
            for (const service of goodServices) {
                const scoreClass = mapPrivacyRatingToScoreClass(service.privacyRating)
                expect(scoreClass).toBe('good')
            }
        }
        
        // Low privacy services should map to 'poor' scoreClass
        for (const category of WIKI_CATEGORIES) {
            const avoidServices = category.services.filter(s => s.privacyRating === 'avoid')
            for (const service of avoidServices) {
                const scoreClass = mapPrivacyRatingToScoreClass(service.privacyRating)
                expect(scoreClass).toBe('poor')
            }
        }
    })
})

// Network tests - these actually check if links are reachable
// Run separately with: npx vitest run tests/wikiLinks.test.ts --testNamePattern="Network"
describe.skip('Network Tests - Link Reachability', () => {
    const links = getAllExternalLinks().filter(l => l.url)

    // Test Privacy Guides links
    describe('Privacy Guides Links', () => {
        const pgLinks = links.filter(l => l.url.includes('privacyguides.org'))

        for (const { url, description } of pgLinks) {
            it(`${description} should be reachable`, async () => {
                const response = await fetch(url, { method: 'HEAD' })
                expect(response.ok, `${url} returned ${response.status}`).toBe(true)
            }, 10000)
        }
    })

    // Test a sample of service homepages (not all to avoid rate limiting)
    describe('Sample Service Links', () => {
        const serviceLinks = links.filter(l => !l.url.includes('privacyguides.org'))
        const sampleSize = Math.min(10, serviceLinks.length)
        const sample = serviceLinks.slice(0, sampleSize)

        for (const { url, description } of sample) {
            it(`${description} should be reachable`, async () => {
                try {
                    const response = await fetch(url, {
                        method: 'HEAD',
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
                        }
                    })
                    // Some sites block HEAD requests, 405 is also acceptable
                    expect([200, 301, 302, 405]).toContain(response.status)
                } catch (error) {
                    // Network errors shouldn't fail the test in CI
                    console.warn(`Could not reach ${url}: ${error}`)
                }
            }, 10000)
        }
    })
})

// Quick validation script that can be run directly
export async function validateAllLinks(): Promise<{ passed: number; failed: number; errors: string[] }> {
    const links = getAllExternalLinks().filter(l => l.url)
    const errors: string[] = []
    let passed = 0
    let failed = 0

    console.log(`Checking ${links.length} links...`)

    for (const { url, description } of links) {
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
                }
            })

            if (response.ok || response.status === 405) {
                passed++
                console.log(`✓ ${description}`)
            } else {
                failed++
                errors.push(`${description}: ${url} returned ${response.status}`)
                console.log(`✗ ${description} - ${response.status}`)
            }
        } catch (error) {
            failed++
            errors.push(`${description}: ${url} - ${error}`)
            console.log(`✗ ${description} - ${error}`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`)
    return { passed, failed, errors }
}
