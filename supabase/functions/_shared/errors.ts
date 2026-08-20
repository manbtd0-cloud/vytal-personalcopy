import { json } from './security.ts'
import { RequestTrace } from './observability.ts'

type PublicError = { code: string; message: string }
type ErrorPolicy = {
  fallback: PublicError & { status: number }
  byStatus?: Record<number, PublicError>
}

const DEFAULT_ERRORS: Record<number, PublicError> = {
  400: { code: 'BAD_REQUEST', message: 'The request is invalid.' },
  401: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication is required.' },
  403: { code: 'FORBIDDEN', message: 'The request is not allowed.' },
  404: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
  405: { code: 'METHOD_NOT_ALLOWED', message: 'The request method is not allowed.' },
  413: { code: 'PAYLOAD_TOO_LARGE', message: 'The request is too large.' },
  429: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait and try again.' },
}

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly publicMessage: string,
    readonly retryable = false,
  ) {
    super(publicMessage)
    this.name = 'AppError'
  }
}

function normalizeError(error: unknown, policy: ErrorPolicy) {
  if (error instanceof AppError) return error
  if (error instanceof Response) {
    const mapped = policy.byStatus?.[error.status] ?? DEFAULT_ERRORS[error.status]
    if (mapped) return new AppError(error.status, mapped.code, mapped.message, error.status >= 500)
  }
  return new AppError(
    policy.fallback.status,
    policy.fallback.code,
    policy.fallback.message,
    policy.fallback.status >= 500,
  )
}

function internalErrorType(error: unknown) {
  if (error instanceof AppError) return error.name
  if (error instanceof Error) return error.name.slice(0, 80)
  return 'UnknownError'
}

export function createFunctionHandler(
  functionName: string,
  policy: ErrorPolicy,
  handler: (req: Request, trace: RequestTrace) => Promise<Response> | Response,
) {
  return async (req: Request) => {
    const trace = new RequestTrace(req, functionName)
    try {
      return trace.attach(await handler(req, trace))
    } catch (error) {
      const normalized = normalizeError(error, policy)
      const response = json(req, {
        error: {
          code: normalized.code,
          message: normalized.publicMessage,
          requestId: trace.requestId,
          retryable: normalized.retryable,
        },
      }, normalized.status)
      return trace.attach(response, 'request.failed', {
        error_code: normalized.code,
        error_type: internalErrorType(error),
        retryable: normalized.retryable,
      })
    }
  }
}
