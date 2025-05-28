export type Rule = {
    suffix: string;
    minStemLength: number;
    replacement: string;
    exceptions: string[];
}

export type Step = {
    name: string;
    minWordLength: number;
    isWholeWordMatch?: boolean;
    conditions: string[];
    rules: Rule[];
}
