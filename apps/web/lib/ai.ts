import { groq } from "@ai-sdk/groq"

// The single place the AI provider/model is chosen. The PRD calls for Claude
// Haiku; we're on Groq (what's installed) for speed/cost. To switch to Claude:
//   bun add @ai-sdk/anthropic
//   import { anthropic } from "@ai-sdk/anthropic"
//   export const parserModel = anthropic("claude-haiku-4-5")
// and set ANTHROPIC_API_KEY instead of GROQ_API_KEY.
export const parserModel = groq("llama-3.3-70b-versatile")
