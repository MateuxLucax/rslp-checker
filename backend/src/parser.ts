import type { Step, Rule } from "./types";

/**
 * Parses RSLP rules from a file and returns an array of steps.
 * 
 * @param filePath - The path to the file containing the RSLP rules.
 * 
 * @returns A promise that resolves to an array of Step objects.
 */
export async function parseRSLPRules(filePath: string): Promise<Step[]> {
    const steps: Step[] = [];
    const data = await Bun.file(filePath).text();
    const lines = data.split('\n');

    let currentStep: Step | undefined;

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.length === 0) continue;
        if (trimmedLine.startsWith('#')) continue;

        if (!currentStep) {
            currentStep = parseStep(trimmedLine);

            continue;
        }

        if (trimmedLine.endsWith(';')) {
            const finalRule = parseRule(trimmedLine.slice(0, -2));

            currentStep.rules.push(finalRule);
            steps.push(currentStep);
            currentStep = undefined;
            continue;
        }

        const rule = parseRule(trimmedLine);

        if (!currentStep) {
            console.error("Rule found without a current step:", trimmedLine);
            throw new Error("Rule found without a current step");
        }

        currentStep.rules.push(rule);
    }

    return steps;
}

/**
 * Parses a step from a line of text.
 * 
 * @param line - The line of text containing the step definition.
 * 
 * @returns An object representing the step with its name, minimum word length, whole word match flag, conditions, and rules.
 */
function parseStep(line: string): Step {
    const stepMatch = line.match(/{[\s]*"([^"]+)"[\s]*,[\s]*(\d+)[\s]*,[\s]*(\d+)[\s]*,[\s]*(.+)/);

    if (!stepMatch) throw new Error(`Invalid step format: ${line}`);

    const name = stepMatch[1]?.replace(/"/g, '');
    if (!name) {
        console.error("Invalid step name:", stepMatch[1]);
        throw new Error("Invalid step name");
    }

    const minWordLength = parseInt(stepMatch[2] || 'error', 10);
    if (isNaN(minWordLength)) {
        console.error("Invalid minimum word length:", stepMatch[2]);
        throw new Error("Invalid minimum word length");
    }

    const isWholeWordMatch = (stepMatch[3] || '0') === '1';

    const conditionsStr = stepMatch[4]?.trim() || '';
    const conditionsRegex = /"([^"]+)"/g;
    const conditions: string[] = [];

    let match;
    while ((match = conditionsRegex.exec(conditionsStr)) !== null) {
        if (match[1]) {
            conditions.push(match[1].trim());
        }
    }

    return {
        name,
        minWordLength,
        isWholeWordMatch,
        conditions,
        rules: []
    };
}

/**
 * Parses a rule from a line of text.
 * 
 * @param line - The line of text containing the rule definition.
 * 
 * @return An object representing the rule with its suffix, minimum stem length, replacement string, and exceptions.
 */
function parseRule(line: string): Rule {
    const ruleMatch = line.match(/\{[\s]*"([^"]*)"[\s]*,[\s]*(\d+)(?:[\s]*,[\s]*"([^"]*)")?(?:[\s]*,[\s]*\{([^\}]*)\})?[\s]*\}/);

    if (!ruleMatch) {
        throw new Error(`Invalid rule format: ${line}`);
    }

    const suffix = ruleMatch[1]?.replace(/"/g, '');
    if (suffix === undefined) {
        console.error("Invalid rule suffix:", ruleMatch[1]);
        throw new Error("Invalid rule suffix");
    }

    const minStemLength = parseInt(ruleMatch[2] || 'error', 10);
    if (isNaN(minStemLength) || minStemLength < 0) {
        console.error("Invalid minimum stem length:", ruleMatch[2]);
        throw new Error("Invalid minimum stem length");
    }

    const replacement = ruleMatch[3] !== undefined ? ruleMatch[3].replace(/"/g, '') : '';
    
    const exceptionStr = ruleMatch[4]?.trim() || '';
    const exceptionRegex = /"([^"]+)"/g;

    const exceptions: string[] = [];
    let match;

    while ((match = exceptionRegex.exec(exceptionStr)) !== null) {
        if (match[1]) {
            exceptions.push(match[1].trim());
        }
    }

    return {
        suffix,
        minStemLength,
        replacement,
        exceptions
    };
}