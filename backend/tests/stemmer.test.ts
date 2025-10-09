import { expect, test, describe, beforeAll } from "bun:test";
import { join } from 'path';
import { parseRSLPRules } from '../src/parser';
import RSLPStemmer from '../src/stemmer';

const RSLP_TEST_CASES = [
    { word: "livros", expected: "livr" },
    { word: "casas", expected: "cas" },
    { word: "meninos", expected: "menin" },
    { word: "mulheres", expected: "mulh" },
    
    // Diminutives
    { word: "casinha", expected: "cas" },
    { word: "livrinho", expected: "livr" },
    { word: "gatinho", expected: "gat" },
    
    // Adverbs (-mente)
    { word: "rapidamente", expected: "rap" },
    { word: "facilmente", expected: "facil" },
    { word: "claramente", expected: "cl" },
    
    // Augmentatives
    { word: "casarão", expected: "cas" },
    { word: "grandão", expected: "grand" },
    
    // Verb conjugations
    { word: "cantando", expected: "cant" },
    { word: "correndo", expected: "corr" },
    { word: "falando", expected: "fal" },
    { word: "cantava", expected: "cant" },
    { word: "corria", expected: "corr" },
    
    // Adjectives
    { word: "bonita", expected: "bonit" },
    { word: "grande", expected: "grand" },
    { word: "pequena", expected: "pequen" },
    
    // Superlatives
    { word: "grandíssimo", expected: "grand" },
    { word: "belíssima", expected: "bel" },
    
    // Professional suffixes
    { word: "professor", expected: "profes" },
    { word: "professora", expected: "profes" },
    { word: "dentista", expected: "dent" },
    
    // Abstract nouns
    { word: "felicidade", expected: "felic" },
    { word: "bondade", expected: "bondad" },
    { word: "liberdade", expected: "liberdad" },
    
    // Words that should not be stemmed (too short or exceptions)
    { word: "eu", expected: "eu" },
    { word: "tu", expected: "tu" },
    { word: "ele", expected: "ele" },
    { word: "de", expected: "de" },
    { word: "em", expected: "em" },
    
    // Complex cases
    { word: "desenvolvimento", expected: "desenvolv" },
    { word: "personalização", expected: "person" },
    { word: "internacionalização", expected: "internacion" },
    
    // Edge cases with special characters
    { word: "coração", expected: "coração" },
    { word: "ação", expected: "ação" },
    { word: "informação", expected: "inform" },
];

let stemmer: RSLPStemmer;

beforeAll(async () => {
    const rslpFilePath = join(process.cwd(), 'assets', 'portuguese.rslp');
    const steps = await parseRSLPRules(rslpFilePath);
    stemmer = new RSLPStemmer(steps);
});

describe("RSLP Stemmer Validation", () => {
    test("should initialize stemmer correctly", () => {
        expect(stemmer).toBeDefined();
    });

    test("should handle empty and null inputs", () => {
        expect(stemmer.stem("")).toBe("");
        expect(stemmer.stem(null as any)).toBe(null as any);
        expect(stemmer.stem(undefined as any)).toBe(undefined as any);
    });

    test("should handle single characters", () => {
        expect(stemmer.stem("a")).toBe("a");
        expect(stemmer.stem("o")).toBe("o");
        expect(stemmer.stem("e")).toBe("e");
    });

    test("should preserve case insensitive behavior", () => {
        expect(stemmer.stem("LIVROS")).toBe(stemmer.stem("livros"));
        expect(stemmer.stem("Livros")).toBe(stemmer.stem("livros"));
        expect(stemmer.stem("LiVrOs")).toBe(stemmer.stem("livros"));
    });

    test("should handle words with special characters", () => {
        const result1 = stemmer.stem("livros!");
        const result2 = stemmer.stem("livros");
        expect(result1).toBe(result2);
        
        const result3 = stemmer.stem("casa,");
        const result4 = stemmer.stem("casa");
        expect(result3).toBe(result4);
    });

    describe("Known test cases validation", () => {
        RSLP_TEST_CASES.forEach(({ word, expected }) => {
            test(`should stem "${word}" to "${expected}"`, () => {
                const result = stemmer.stem(word);
                expect(result).toBe(expected);
            });
        });
    });

    describe("Consistency tests", () => {
        test("should produce same result for multiple calls", () => {
            const word = "desenvolvimento";
            const result1 = stemmer.stem(word);
            const result2 = stemmer.stem(word);
            const result3 = stemmer.stem(word);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });

        test("should handle batch processing correctly", () => {
            const words = ["casa", "casas", "casinha", "casarão"];
            const results = words.map(word => stemmer.stem(word));

            expect(results.every(result => result === "cas")).toBe(true);
        });
    });

    describe("Edge cases", () => {
        test("should handle words with numbers", () => {
            expect(() => stemmer.stem("casa123")).not.toThrow();
            expect(() => stemmer.stem("123casa")).not.toThrow();
        });

        test("should handle accented characters", () => {
            const accentedWords = ["ação", "coração", "alemão", "português", "José"];
            accentedWords.forEach(word => {
                expect(() => {
                    const result = stemmer.stem(word);
                    expect(typeof result).toBe("string");
                }).not.toThrow();
            });
        });

        test("should handle words that don't need stemming", () => {
            const unchangedWords = ["eu", "tu", "de", "em", "por"];
            unchangedWords.forEach(word => {
                const result = stemmer.stem(word);
                expect(result).toBe(word);
            });
        });
    });

    describe("Rule validation", () => {
        test("should correctly apply plural rules", () => {
            const plurals = [
                { singular: "gato", plural: "gatos" },
                { singular: "casa", plural: "casas" },
                { singular: "cão", plural: "cães" },
                { singular: "animal", plural: "animais" }
            ];

            plurals.forEach(({ singular, plural }) => {
                const stemSingular = stemmer.stem(singular);
                const stemPlural = stemmer.stem(plural);
                expect(Math.abs(stemSingular.length - stemPlural.length)).toBeLessThanOrEqual(2);
            });
        });

        test("should correctly apply diminutive rules", () => {
            const diminutives = [
                { base: "casa", diminutive: "casinha" },
                { base: "livro", diminutive: "livrinho" },
                { base: "gato", diminutive: "gatinho" }
            ];

            diminutives.forEach(({ base, diminutive }) => {
                const stemBase = stemmer.stem(base);
                const stemDiminutive = stemmer.stem(diminutive);
                expect(stemDiminutive.startsWith(stemBase.substring(0, stemBase.length - 1))).toBe(true);
            });
        });

        test("should correctly apply verb conjugation rules", () => {
            const verbs = [
                { infinitive: "cantar", conjugated: "cantando" },
                { infinitive: "correr", conjugated: "correndo" },
                { infinitive: "partir", conjugated: "partindo" }
            ];

            verbs.forEach(({ infinitive, conjugated }) => {
                const stemInfinitive = stemmer.stem(infinitive);
                const stemConjugated = stemmer.stem(conjugated);
                expect(stemConjugated.startsWith(stemInfinitive.substring(0, stemInfinitive.length - 1))).toBe(true);
            });
        });
    });
});