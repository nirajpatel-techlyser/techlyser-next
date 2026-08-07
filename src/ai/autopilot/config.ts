export function isAutopilotEnabled(): boolean {
  const flag = process.env.AI_AUTOPILOT_ENABLED?.trim().toLowerCase();
  return flag !== "false" && flag !== "0" && flag !== "off";
}

export function autopilotOncePerDay(): boolean {
  const flag = process.env.AI_AUTOPILOT_ONCE_PER_DAY?.trim().toLowerCase();
  return flag !== "false" && flag !== "0";
}

export function autopilotPublishEnabled(): boolean {
  const flag = process.env.AI_AUTOPILOT_PUBLISH?.trim().toLowerCase();
  return flag === "true" || flag === "1";
}

export function getImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "dall-e-3";
}

export const AUTOPILOT_WORKFLOW_ID = "daily-autopilot";

export const DEFAULT_AUDIENCE =
  "ecommerce founders, D2C brands, and marketing leaders in India";
