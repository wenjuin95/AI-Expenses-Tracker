export type ErrorWithStatus = Error & {
  status?: number;
};

function hasStatus(error: Error): error is ErrorWithStatus {
  return 'status' in error && typeof error.status === 'number';
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!(error instanceof Error) || !hasStatus(error)) {
    return undefined;
  }

  return error.status;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
