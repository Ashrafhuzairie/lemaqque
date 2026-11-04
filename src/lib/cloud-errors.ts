/** Keep operator-facing schema errors understandable without hiding other failures. */
export class CloudSetupError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(
      "Cloud storage setup is incomplete. Please retry after the website owner finishes setup.",
    );
    this.name = "CloudSetupError";
    this.code = code;
  }
}
export function cloudDataError(error: {
  code?: string;
  message: string;
}): Error {
  return error.code === "PGRST205" || error.code === "PGRST202"
    ? new CloudSetupError(error.code)
    : new Error(error.message);
}
