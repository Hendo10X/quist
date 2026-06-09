import { codeToHtml } from "shiki"

// Dual-theme: Shiki emits CSS variables for both, and globals.css switches them
// based on the `.dark` class. Backgrounds come from the surrounding container.
const themes = { light: "vitesse-light", dark: "vitesse-dark" } as const

export async function highlightCode(
  code: string,
  lang: string | null
): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang: lang || "text",
      themes,
      defaultColor: false,
    })
  } catch {
    // Unknown / unsupported language → render as plain text.
    return await codeToHtml(code, { lang: "text", themes, defaultColor: false })
  }
}
