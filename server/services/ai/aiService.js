/**
 * Unified AI Service — single entry point for all AI features.
 * Routes through OpenRouter to open-source models (Qwen, DeepSeek, Llama).
 */
const OpenAI = require('openai');
const { CacheManager } = require('./cacheManager');
const { TokenTracker } = require('./tokenTracker');
const { RateLimiter } = require('./rateLimiter');
const { getConfig } = require('./config');

class AIService {
  constructor() {
    this.config = getConfig();
    this.cache = new CacheManager();
    this.tokenTracker = new TokenTracker();
    this.rateLimiter = new RateLimiter();
    this._client = null;
  }

  /** Lazy-init OpenAI client (allows env to load via dotenv first) */
  get client() {
    if (!this._client) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not set. Get one at https://openrouter.ai/keys');
      }
      this._client = new OpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.APP_URL || 'https://autoresilience.ai',
          'X-Title': 'AutoResilience AI',
        },
      });
    }
    return this._client;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Main chat completion method.
   */
  async chat(prompt, options = {}) {
    const {
      feature = 'general',
      userId,
      history = [],
      systemPrompt,
      model = 'auto',
      temperature = 0.7,
      maxTokens = 2000,
      language = 'ar',
      useCache = false,
    } = options;

    await this.rateLimiter.check(userId, feature);

    const selectedModel = this._selectModel(feature, model, language);
    const messages = this._buildMessages(systemPrompt, history, prompt, language);

    // Cache check
    if (useCache) {
      const cacheKey = this.cache.generateKey(selectedModel, messages, temperature);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        await this.tokenTracker.trackCacheHit(feature, userId);
        return cached;
      }
    }

    // Call OpenRouter with multi-level fallback
    const startTime = Date.now();
    let response;
    const modelsToTry = [selectedModel];
    if (options.fallbackEnabled !== false) {
      if (this.config.models.fallback && this.config.models.fallback !== selectedModel) {
        modelsToTry.push(this.config.models.fallback);
      }
      if (this.config.models.free && !modelsToTry.includes(this.config.models.free)) {
        modelsToTry.push(this.config.models.free);
      }
    }

    let lastError;
    for (const modelId of modelsToTry) {
      try {
        response = await this.client.chat.completions.create({
          model: modelId,
          messages,
          temperature,
          max_tokens: maxTokens,
        });
        if (response) break; // Success
      } catch (err) {
        lastError = err;
        console.warn(`[AI] Model ${modelId} failed:`, err.message);
      }
    }

    if (!response) {
      throw lastError || new Error('All AI models failed. Check OPENROUTER_API_KEY and model availability.');
    }

    const latencyMs = Date.now() - startTime;
    const result = {
      content: response.choices[0].message.content,
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      latencyMs,
      finishReason: response.choices[0].finish_reason,
    };

    // Track usage
    await this.tokenTracker.track({
      feature,
      userId,
      model: selectedModel,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      latencyMs,
      estimatedCostUSD: this._estimateCost(selectedModel, result.usage),
    });

    // Cache result
    if (useCache) {
      const cacheKey = this.cache.generateKey(selectedModel, messages, temperature);
      await this.cache.set(cacheKey, result, this.config.cache.ttl);
    }

    return result;
  }

  /**
   * Generate structured JSON — used by simulation, generator, compliance.
   */
  async generateJSON(prompt, schema, options = {}) {
    const jsonPrompt = this._buildJSONPrompt(prompt, schema, options.language || 'ar');

    const result = await this.chat(jsonPrompt, {
      ...options,
      temperature: options.temperature ?? 0.3,
      systemPrompt: options.systemPrompt || this._getJSONSystemPrompt(options.language || 'ar'),
    });

    try {
      const cleaned = result.content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return { ...result, data: parsed };
    } catch (err) {
      // One retry with an explicit instruction
      if (!options._isRetry) {
        return this.generateJSON(
          prompt + '\n\nIMPORTANT: Return ONLY valid JSON with no markdown, no explanation.',
          schema,
          { ...options, _isRetry: true }
        );
      }
      throw new Error(`Failed to parse AI JSON response: ${err.message}`);
    }
  }

  /**
   * Analyze large documents with automatic chunking.
   */
  async analyzeDocument(documentText, analysisSchema, options = {}) {
    const { feature = 'document_analysis', chunkSize = 15000, language = 'ar' } = options;
    const chunks = this._chunkText(documentText, chunkSize);
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkPrompt = `
${analysisSchema.instructions}

This is chunk ${i + 1} of ${chunks.length}.

Content:
${chunks[i]}

Return JSON matching:
${JSON.stringify(analysisSchema.outputSchema, null, 2)}
      `.trim();

      const result = await this.generateJSON(chunkPrompt, analysisSchema.outputSchema, {
        feature,
        language,
        temperature: 0.2,
        maxTokens: 4000,
      });
      results.push(result.data);
    }

    return analysisSchema.mergeStrategy
      ? analysisSchema.mergeStrategy(results)
      : results.length === 1
        ? results[0]
        : results;
  }

  /**
   * Streaming responses — for real-time AI Agent chat.
   */
  async stream(prompt, onToken, options = {}) {
    const selectedModel = this._selectModel(options.feature, options.model, options.language);
    const messages = this._buildMessages(
      options.systemPrompt, options.history || [], prompt, options.language || 'ar'
    );

    const stream = await this.client.chat.completions.create({
      model: selectedModel,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: true,
    });

    let fullContent = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullContent += token;
        onToken(token);
      }
    }
    return { content: fullContent, model: selectedModel };
  }

  /**
   * List available models from OpenRouter (filtered to open-source).
   */
  async listAvailableModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      });
      const data = await response.json();
      return (data.data || []).filter(
        (m) =>
          m.id.includes('qwen') ||
          m.id.includes('llama') ||
          m.id.includes('deepseek') ||
          m.id.includes('mistral')
      );
    } catch {
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  _selectModel(feature, requested, _language) {
    if (requested && requested !== 'auto') return requested;

    // Use config models (env-overridable) instead of hardcoded IDs
    const primary = this.config.models.primary;
    const fast = this.config.models.fast;

    const featureModelMap = {
      // High quality — Arabic reasoning
      ai_agent:          primary,
      risk_simulation:   primary,
      risk_generator:    primary,
      sumood_compliance: primary,
      document_analysis: primary,
      // Fast & cheap
      predictive_insights: fast,
      regulatory_analysis: fast,
      dashboard_summary:   fast,
      classification:      fast,
      // Default
      general: fast,
    };

    return featureModelMap[feature] || fast;
  }

  _buildMessages(systemPrompt, history, currentPrompt, language) {
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    } else {
      messages.push({
        role: 'system',
        content:
          language === 'ar'
            ? 'أنت مساعد متخصص في إدارة المخاطر والامتثال للمؤسسات السعودية. أجب بالعربية الفصحى الرسمية. كن دقيقاً ومختصراً واحترافياً.'
            : 'You are a specialized AI assistant for enterprise risk management and compliance in Saudi Arabian organizations. Answer clearly, concisely, and professionally.',
      });
    }

    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: 'user', content: currentPrompt });
    return messages;
  }

  _buildJSONPrompt(prompt, schema, language) {
    return `${prompt}

${
  language === 'ar'
    ? 'أرجع إجابتك كـ JSON صالح فقط، بدون Markdown، بدون code blocks، بدون أي نص خارج JSON.'
    : 'Return your answer as valid JSON only, no markdown, no code blocks.'
}

Schema:
${JSON.stringify(schema, null, 2)}`;
  }

  _getJSONSystemPrompt(language) {
    return language === 'ar'
      ? 'أنت مساعد متخصص يُرجع دائماً استجابات JSON صالحة ومنظمة. لا تضف أي نص خارج JSON.'
      : 'You are a specialized assistant that always returns valid, structured JSON responses.';
  }

  _chunkText(text, maxChars) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxChars) {
      chunks.push(text.substring(i, i + maxChars));
    }
    return chunks;
  }

  _estimateCost(model, usage) {
    const pricing = {
      'qwen/qwen3.6-plus':                    { input: 0.50, output: 0.50 },
      'deepseek/deepseek-v4-flash':           { input: 0.10, output: 0.30 },
      'deepseek/deepseek-v4-pro':             { input: 0.40, output: 1.20 },
      'meta-llama/llama-3.3-70b-instruct':    { input: 0.23, output: 0.40 },
      'mistralai/mistral-large-2411':         { input: 2.00, output: 6.00 },
    };

    const p = pricing[model] || { input: 0.50, output: 1.00 };
    return (usage.inputTokens * p.input + usage.outputTokens * p.output) / 1_000_000;
  }
}

// Singleton export
module.exports = new AIService();
