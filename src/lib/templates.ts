/**
 * Built-in prompt templates for PromptForge.
 *
 * Each template provides a production-quality prompt with a detailed system
 * message, realistic placeholders, and tuned default parameters.
 */

import type { Template } from '@/types';
import { DEFAULT_MODEL_PARAMS } from './constants';

export const BUILT_IN_TEMPLATES: Template[] = [
  // ─── 1. Code Generator ───────────────────────────────────────────────
  {
    id: 'tpl-code-generator',
    name: 'Code Generator',
    category: 'code-generation',
    description:
      'Generate clean, well-structured code in any language based on a task description.',
    content: `You are tasked with generating production-quality {{language}} code.

## Task
{{task}}

## Requirements
- Follow {{language}} best practices and idiomatic conventions
- Include proper error handling and edge case coverage
- Add concise inline comments for complex logic
- Use meaningful variable and function names
- Ensure the code is ready to integrate into a real project

Please provide the complete implementation.`,
    systemMessage: `You are an expert {{language}} developer. You write clean, efficient, and well-documented code. Always follow the language's official style guide. Provide only the code with brief comments — no lengthy explanations unless asked. If the task is ambiguous, state your assumptions before coding.`,
    placeholders: [
      {
        key: 'language',
        defaultValue: 'TypeScript',
        description: 'The programming language to generate code in.',
        type: 'select',
        options: [
          'TypeScript',
          'JavaScript',
          'Python',
          'Rust',
          'Go',
          'Java',
          'C#',
          'C++',
        ],
      },
      {
        key: 'task',
        defaultValue: '',
        description:
          'A clear description of what the code should do.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.4, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'code',
  },

  // ─── 2. Bug Fixer ────────────────────────────────────────────────────
  {
    id: 'tpl-bug-fixer',
    name: 'Bug Fixer',
    category: 'debugging',
    description:
      'Analyze code to identify and fix bugs, explaining the root cause.',
    content: `Analyze the following {{language}} code and identify any bugs, errors, or potential issues.

## Code to Analyze
\`\`\`{{language}}
{{code}}
\`\`\`

## Instructions
1. **Identify** each bug or issue with a clear description of the problem
2. **Explain** the root cause — why does this bug occur?
3. **Fix** the code, providing the corrected version
4. **Verify** that the fix doesn't introduce new issues
5. If there are multiple bugs, address them in order of severity

Provide the corrected code with comments marking each fix.`,
    systemMessage: `You are a senior software engineer specializing in debugging and code analysis. You have a keen eye for subtle bugs including off-by-one errors, race conditions, null pointer issues, memory leaks, and logic errors. Always explain the "why" behind each bug, not just the fix. Be thorough but concise.`,
    placeholders: [
      {
        key: 'language',
        defaultValue: 'TypeScript',
        description: 'The programming language of the code.',
        type: 'select',
        options: [
          'TypeScript',
          'JavaScript',
          'Python',
          'Rust',
          'Go',
          'Java',
          'C#',
          'C++',
        ],
      },
      {
        key: 'code',
        defaultValue: '',
        description: 'The code containing the bug(s) to analyze.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.2, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'bug',
  },

  // ─── 3. Code Reviewer ────────────────────────────────────────────────
  {
    id: 'tpl-code-reviewer',
    name: 'Code Reviewer',
    category: 'code-review',
    description:
      'Perform a thorough code review against specified criteria.',
    content: `Perform a comprehensive code review of the following code, focusing on **{{criteria}}**.

## Code to Review
\`\`\`
{{code}}
\`\`\`

## Review Guidelines
For each issue found, provide:
- **Severity**: 🔴 Critical | 🟡 Warning | 🔵 Suggestion
- **Location**: The relevant line or section
- **Issue**: What's wrong and why it matters
- **Recommendation**: How to fix or improve it

Also highlight any strengths or well-written sections.

Conclude with a summary rating and prioritized action items.`,
    systemMessage: `You are a principal engineer conducting a code review. You evaluate code for correctness, performance, security, readability, and maintainability. You are constructive and specific — avoid vague feedback. Prioritize issues by impact. Recognize good patterns as well as problems.`,
    placeholders: [
      {
        key: 'criteria',
        defaultValue: 'performance, security, and readability',
        description: 'The review criteria to focus on.',
        type: 'text',
      },
      {
        key: 'code',
        defaultValue: '',
        description: 'The code to review.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.3, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'eye',
  },

  // ─── 4. Refactorer ───────────────────────────────────────────────────
  {
    id: 'tpl-refactorer',
    name: 'Refactorer',
    category: 'refactoring',
    description:
      'Refactor existing code to improve a specific quality goal.',
    content: `Refactor the following {{language}} code to improve **{{goal}}**.

## Current Code
\`\`\`{{language}}
{{code}}
\`\`\`

## Refactoring Requirements
1. Improve {{goal}} while preserving the existing behavior exactly
2. Apply relevant design patterns where appropriate
3. Reduce code duplication and complexity
4. Ensure the refactored code is well-tested and maintainable
5. Explain each significant change and why it improves {{goal}}

Provide the complete refactored code followed by a summary of changes.`,
    systemMessage: `You are a software architect specializing in code refactoring. You deeply understand SOLID principles, design patterns, and clean code practices. When refactoring, you never change external behavior — only internal structure. You explain the trade-offs of each change and ensure the result is strictly better along the requested dimension.`,
    placeholders: [
      {
        key: 'language',
        defaultValue: 'TypeScript',
        description: 'The programming language of the code.',
        type: 'select',
        options: [
          'TypeScript',
          'JavaScript',
          'Python',
          'Rust',
          'Go',
          'Java',
          'C#',
          'C++',
        ],
      },
      {
        key: 'goal',
        defaultValue: 'readability and maintainability',
        description:
          'The quality attribute to optimize for (e.g. performance, readability, testability).',
        type: 'text',
      },
      {
        key: 'code',
        defaultValue: '',
        description: 'The code to refactor.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.3, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'refresh-cw',
  },

  // ─── 5. Test Writer ──────────────────────────────────────────────────
  {
    id: 'tpl-test-writer',
    name: 'Test Writer',
    category: 'testing',
    description:
      'Generate comprehensive test suites for existing code.',
    content: `Write a comprehensive {{testFramework}} test suite for the following code:

## Code Under Test
\`\`\`
{{code}}
\`\`\`

## Testing Requirements
- Cover all public functions and methods
- Include positive tests (happy path) and negative tests (error cases)
- Test edge cases and boundary conditions
- Use descriptive test names that explain the expected behavior
- Group related tests using describe/context blocks
- Add setup and teardown where needed
- Mock external dependencies appropriately
- Aim for high branch coverage

Provide the complete, runnable test file.`,
    systemMessage: `You are a QA engineer and testing expert. You write thorough, maintainable test suites that catch real bugs. You follow the Arrange-Act-Assert pattern and write test names that serve as documentation. You understand the difference between unit, integration, and end-to-end tests and choose the right approach for each case.`,
    placeholders: [
      {
        key: 'testFramework',
        defaultValue: 'Vitest',
        description: 'The testing framework to use.',
        type: 'select',
        options: ['Vitest', 'Jest', 'Mocha', 'pytest', 'JUnit', 'xUnit', 'Go testing'],
      },
      {
        key: 'code',
        defaultValue: '',
        description: 'The code to write tests for.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.3, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'flask-conical',
  },

  // ─── 6. Documenter ───────────────────────────────────────────────────
  {
    id: 'tpl-documenter',
    name: 'Documenter',
    category: 'documentation',
    description:
      'Generate professional documentation for code in various styles.',
    content: `Generate {{docStyle}} documentation for the following code:

## Code to Document
\`\`\`
{{code}}
\`\`\`

## Documentation Requirements
- Document all public interfaces, classes, functions, and methods
- Include parameter descriptions with types
- Document return values and possible exceptions/errors
- Add usage examples where helpful
- Note any important side effects or preconditions
- Follow the conventions of the {{docStyle}} format
- Be precise and concise — avoid filler text

Provide the documented code or documentation file as appropriate.`,
    systemMessage: `You are a technical writer with deep programming expertise. You write documentation that is accurate, concise, and genuinely useful. You know the difference between documenting "what" (API reference) and "why" (guides). You follow the conventions of the requested documentation format exactly.`,
    placeholders: [
      {
        key: 'docStyle',
        defaultValue: 'JSDoc',
        description: 'The documentation format or style to use.',
        type: 'select',
        options: [
          'JSDoc',
          'TSDoc',
          'Javadoc',
          'Python docstring (Google style)',
          'Python docstring (NumPy style)',
          'Rustdoc',
          'Markdown README',
          'OpenAPI / Swagger',
        ],
      },
      {
        key: 'code',
        defaultValue: '',
        description: 'The code to generate documentation for.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.3, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'file-text',
  },

  // ─── 7. Architect ────────────────────────────────────────────────────
  {
    id: 'tpl-architect',
    name: 'Architect',
    category: 'architecture',
    description:
      'Design a software architecture based on requirements.',
    content: `Design a {{type}} architecture for the following system:

## Requirements
{{requirements}}

## Deliverables
1. **High-Level Overview**: A concise description of the architecture and the key design decisions
2. **Component Diagram**: List all major components/modules with their responsibilities
3. **Data Flow**: How data moves through the system
4. **Technology Stack**: Recommended technologies with justifications
5. **API Contracts**: Key interfaces between components (signatures, not full implementations)
6. **Scalability & Trade-offs**: How the architecture handles growth and what trade-offs were made
7. **Security Considerations**: Authentication, authorization, and data protection strategy

Use clear headings and diagrams (Mermaid syntax where applicable).`,
    systemMessage: `You are a senior solutions architect with experience designing systems at scale. You balance pragmatism with best practices, choosing the simplest architecture that meets the requirements. You always consider maintainability, scalability, security, and cost. When making trade-offs, you explain them explicitly.`,
    placeholders: [
      {
        key: 'type',
        defaultValue: 'microservices',
        description: 'The architecture style to design.',
        type: 'select',
        options: [
          'microservices',
          'monolithic',
          'serverless',
          'event-driven',
          'modular monolith',
          'hexagonal',
          'CQRS',
        ],
      },
      {
        key: 'requirements',
        defaultValue: '',
        description:
          'The system requirements and constraints to design for.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.5, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'blocks',
  },

  // ─── 8. Explainer ────────────────────────────────────────────────────
  {
    id: 'tpl-explainer',
    name: 'Explainer',
    category: 'general',
    description:
      'Get a step-by-step explanation of how a piece of code works.',
    content: `Explain the following code step by step:

\`\`\`
{{code}}
\`\`\`

## Explanation Format
1. **Purpose**: What does this code accomplish overall?
2. **Step-by-Step Walkthrough**: Go through the code line by line (or block by block), explaining:
   - What each section does
   - Why it's written this way
   - Any algorithms or patterns being used
3. **Key Concepts**: List any important programming concepts someone would need to understand this code
4. **Potential Issues**: Note any edge cases, performance concerns, or possible improvements
5. **Summary**: A one-paragraph plain-English summary suitable for documentation

Keep explanations clear and accessible without being condescending.`,
    systemMessage: `You are a patient, experienced programming mentor. You explain code clearly to developers of all levels. You break down complex logic into understandable pieces, relate concepts to real-world analogies when helpful, and always explain the "why" not just the "what". You never assume knowledge — if a concept is important, you briefly explain it.`,
    placeholders: [
      {
        key: 'code',
        defaultValue: '',
        description: 'The code snippet to explain.',
        type: 'text',
      },
    ],
    defaultParameters: { ...DEFAULT_MODEL_PARAMS, temperature: 0.4, maxTokens: 4096 },
    isBuiltIn: true,
    usageCount: 0,
    icon: 'lightbulb',
  },
];
