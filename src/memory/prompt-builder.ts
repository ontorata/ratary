export interface PromptBuildInput {
  systemRole?: string;
  contextBlock: string;
  userTask: string;
  projectId?: string;
}

export interface BuiltPrompt {
  system: string;
  user: string;
}

const DEFAULT_SYSTEM_ROLE = `You are a coding assistant with access to curated project memory.
Use the provided context as ground truth. Cite memory codenames when referencing facts.
If the context is insufficient, say so clearly instead of guessing.`;

export class PromptBuilder {
  build(input: PromptBuildInput): BuiltPrompt {
    const projectLine = input.projectId ? `\nActive project: ${input.projectId}` : '';
    const system = `${input.systemRole ?? DEFAULT_SYSTEM_ROLE}${projectLine}`;

    const user = `## Task\n${input.userTask}\n\n## Memory Context\n${input.contextBlock}`;

    return { system, user };
  }
}
