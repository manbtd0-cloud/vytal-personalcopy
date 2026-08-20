import { fetchWithResilience } from './network.ts'

type CompletionPayload = {
  choices?: Array<{ message?: { content?: string } }>
}

abstract class AiProviderAdapter {
  constructor(
    readonly name: string,
    protected readonly endpoint: string,
    protected readonly apiKey: string,
    protected readonly model: string,
  ) {}

  async complete(prompt: string) {
    const response = await fetchWithResilience(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 180,
      }),
    })
    if (!response.ok) throw new Error(`${this.name} returned HTTP ${response.status}.`)
    const data = await response.json() as CompletionPayload
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error(`${this.name} returned an empty response.`)
    return text
  }
}

class GroqProviderAdapter extends AiProviderAdapter {
  constructor(apiKey: string) {
    super('Groq', 'https://api.groq.com/openai/v1/chat/completions', apiKey, 'llama-3.3-70b-versatile')
  }
}

class DashscopeProviderAdapter extends AiProviderAdapter {
  constructor(apiKey: string) {
    super('DashScope', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', apiKey, 'qwen-plus')
  }
}

export class AiProviderFactory {
  static createFromEnvironment(): AiProviderAdapter | null {
    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (groqKey) return new GroqProviderAdapter(groqKey)
    const dashscopeKey = Deno.env.get('DASHSCOPE_API_KEY')
    if (dashscopeKey) return new DashscopeProviderAdapter(dashscopeKey)
    return null
  }
}
