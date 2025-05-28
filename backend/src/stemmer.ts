import type { Step, Rule } from "./types";

class RSLPStemmer {
    private steps: Step[];

    constructor(steps: Step[]) {
        this.steps = steps;
    }

    /**
     * Stems a word according to the RSLP algorithm
     * @param word The word to stem
     * @returns The stemmed word
     */
    public stem(word: string): string {
        if (!word) return word;
        
        let stemmed = word.toLowerCase();
        stemmed = this.stripSpecialCharacters(stemmed);

        // Apply each step in order
        for (const step of this.steps) {
            // Skip step if word is too short
            if (stemmed.length < step.minWordLength) {
                continue;
            }
            
            // Skip step if word doesn't match any condition (optimization)
            if (step.conditions.length > 0) {
                const matchesCondition = step.conditions.some(condition => 
                    stemmed.endsWith(condition));
                if (!matchesCondition) {
                    continue;
                }
            }
            
            // Try each rule in the step
            for (const rule of step.rules) {
                // Check if rule can be applied
                if (this.canApplyRule(stemmed, rule, step.isWholeWordMatch)) {
                    // Apply the rule
                    stemmed = this.applyRule(stemmed, rule);
                    // Only apply the first matching rule in the step
                    break;
                }
            }
        }
        
        return stemmed;
    }

    /**
     * Strips special characters from a word (keeping only alphanumeric characters, incluiding with accents)
     */
    private stripSpecialCharacters(word: string): string {
        return word.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9]/g, '').trim();
    }
    
    /**
     * Checks if a rule can be applied to a word
     */
    private canApplyRule(word: string, rule: Rule, isWholeWordMatch: boolean = false): boolean {
        // Check if word ends with suffix
        if (!word.endsWith(rule.suffix)) {
            return false;
        }
        
        if (rule.exceptions.length > 0) {
            if (isWholeWordMatch) {
                if (rule.exceptions.includes(word)) {
                    return false;
                }
            } else {
                for (const exception of rule.exceptions) {
                    if (word.endsWith(exception)) {
                        return false;
                    }
                }
            }
        }
        
        const stemLength = word.length - rule.suffix.length;
        if (stemLength < rule.minStemLength) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Applies a rule to a word
     */
    private applyRule(word: string, rule: Rule): string {
        const stem = word.slice(0, word.length - rule.suffix.length);
        return stem + rule.replacement;
    }
}

export default RSLPStemmer;