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
        // Arrange - stemmer is already initialized in beforeAll

        // Act - no action needed

        // Assert
        expect(stemmer).toBeDefined();
    });

    test("should handle empty and null inputs", () => {
        // Arrange
        const emptyString = "";
        const nullInput = null as any;
        const undefinedInput = undefined as any;

        // Act
        const emptyResult = stemmer.stem(emptyString);
        const nullResult = stemmer.stem(nullInput);
        const undefinedResult = stemmer.stem(undefinedInput);

        // Assert
        expect(emptyResult).toBe("");
        expect(nullResult).toBe(null as any);
        expect(undefinedResult).toBe(undefined as any);
    });

    test("should handle single characters", () => {
        // Arrange
        const singleCharA = "a";
        const singleCharO = "o";
        const singleCharE = "e";

        // Act
        const resultA = stemmer.stem(singleCharA);
        const resultO = stemmer.stem(singleCharO);
        const resultE = stemmer.stem(singleCharE);

        // Assert
        expect(resultA).toBe("a");
        expect(resultO).toBe("o");
        expect(resultE).toBe("e");
    });

    test("should preserve case insensitive behavior", () => {
        // Arrange
        const upperCaseWord = "LIVROS";
        const titleCaseWord = "Livros";
        const mixedCaseWord = "LiVrOs";
        const lowerCaseWord = "livros";

        // Act
        const upperResult = stemmer.stem(upperCaseWord);
        const titleResult = stemmer.stem(titleCaseWord);
        const mixedResult = stemmer.stem(mixedCaseWord);
        const lowerResult = stemmer.stem(lowerCaseWord);

        // Assert
        expect(upperResult).toBe(lowerResult);
        expect(titleResult).toBe(lowerResult);
        expect(mixedResult).toBe(lowerResult);
    });

    test("should handle words with special characters", () => {
        // Arrange
        const wordWithExclamation = "livros!";
        const cleanWord1 = "livros";
        const wordWithComma = "casa,";
        const cleanWord2 = "casa";

        // Act
        const resultWithExclamation = stemmer.stem(wordWithExclamation);
        const resultClean1 = stemmer.stem(cleanWord1);
        const resultWithComma = stemmer.stem(wordWithComma);
        const resultClean2 = stemmer.stem(cleanWord2);

        // Assert
        expect(resultWithExclamation).toBe(resultClean1);
        expect(resultWithComma).toBe(resultClean2);
    });

    describe("Known test cases validation", () => {
        RSLP_TEST_CASES.forEach(({ word, expected }) => {
            test(`should stem "${word}" to "${expected}"`, () => {
                // Arrange
                const inputWord = word;
                const expectedStem = expected;

                // Act
                const result = stemmer.stem(inputWord);

                // Assert
                expect(result).toBe(expectedStem);
            });
        });
    });

    describe("Consistency tests", () => {
        test("should produce same result for multiple calls", () => {
            // Arrange
            const word = "desenvolvimento";

            // Act
            const result1 = stemmer.stem(word);
            const result2 = stemmer.stem(word);
            const result3 = stemmer.stem(word);

            // Assert
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });

        test("should handle batch processing correctly", () => {
            // Arrange
            const words = ["casa", "casas", "casinha", "casarão"];
            const expectedStem = "cas";

            // Act
            const results = words.map(word => stemmer.stem(word));

            // Assert
            expect(results.every(result => result === expectedStem)).toBe(true);
        });
    });

    describe("Edge cases", () => {
        test("should handle words with numbers", () => {
            // Arrange
            const wordWithNumbersSuffix = "casa123";
            const wordWithNumbersPrefix = "123casa";

            // Act & Assert
            expect(() => stemmer.stem(wordWithNumbersSuffix)).not.toThrow();
            expect(() => stemmer.stem(wordWithNumbersPrefix)).not.toThrow();
        });

        test("should handle accented characters", () => {
            // Arrange
            const accentedWords = ["ação", "coração", "alemão", "português", "José"];

            // Act & Assert
            accentedWords.forEach(word => {
                expect(() => {
                    const result = stemmer.stem(word);
                    expect(typeof result).toBe("string");
                }).not.toThrow();
            });
        });

        test("should handle words that don't need stemming", () => {
            // Arrange
            const unchangedWords = ["eu", "tu", "de", "em", "por"];

            // Act & Assert
            unchangedWords.forEach(word => {
                const result = stemmer.stem(word);
                expect(result).toBe(word);
            });
        });
    });

    describe("Rule validation", () => {
        test("should correctly apply plural rules", () => {
            // Arrange
            const plurals = [
                { singular: "gato", plural: "gatos" },
                { singular: "casa", plural: "casas" },
                { singular: "cão", plural: "cães" },
                { singular: "animal", plural: "animais" }
            ];
            const maxLengthDifference = 2;

            // Act & Assert
            plurals.forEach(({ singular, plural }) => {
                const stemSingular = stemmer.stem(singular);
                const stemPlural = stemmer.stem(plural);
                const lengthDifference = Math.abs(stemSingular.length - stemPlural.length);

                expect(lengthDifference).toBeLessThanOrEqual(maxLengthDifference);
            });
        });

        test("should correctly apply diminutive rules", () => {
            // Arrange
            const diminutives = [
                { base: "casa", diminutive: "casinha" },
                { base: "livro", diminutive: "livrinho" },
                { base: "gato", diminutive: "gatinho" }
            ];

            // Act & Assert
            diminutives.forEach(({ base, diminutive }) => {
                const stemBase = stemmer.stem(base);
                const stemDiminutive = stemmer.stem(diminutive);
                const basePrefix = stemBase.substring(0, stemBase.length - 1);
                
                expect(stemDiminutive.startsWith(basePrefix)).toBe(true);
            });
        });

        test("should correctly apply verb conjugation rules", () => {
            // Arrange
            const verbs = [
                { infinitive: "cantar", conjugated: "cantando" },
                { infinitive: "correr", conjugated: "correndo" },
                { infinitive: "partir", conjugated: "partindo" }
            ];

            // Act & Assert
            verbs.forEach(({ infinitive, conjugated }) => {
                const stemInfinitive = stemmer.stem(infinitive);
                const stemConjugated = stemmer.stem(conjugated);
                const infinitivePrefix = stemInfinitive.substring(0, stemInfinitive.length - 1);

                expect(stemConjugated.startsWith(infinitivePrefix)).toBe(true);
            });
        });
    });
});
