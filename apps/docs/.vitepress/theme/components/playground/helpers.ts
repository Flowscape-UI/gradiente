import { tokenizePattern, validatePattern } from "gradiente"


function getErrorRange(message: string, input: string) {
  const match = message.match(/at index (\d+)/)

  if (!match) {
    return {
      start: 0,
      end: Math.max(1, input.length),
    }
  }

  const index = Number(match[1])

  return {
    start: Math.max(0, index),
    end: Math.min(input.length, index + 1),
  }
}


export function analyzePattern(input: string) {
  try {
    const tokens = tokenizePattern(input)

    validatePattern(input)

    return {
      valid: true,
      tokens,
      diagnostics: [],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid pattern'
    const range = getErrorRange(message, input)

    return {
      valid: false,
      tokens: [],
      diagnostics: [
        {
          message,
          start: range.start,
          end: range.end,
          severity: 'error',
        },
      ],
    }
  }
}