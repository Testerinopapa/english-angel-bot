export function webhookUrl(): string {
  if (typeof window === "undefined") return "/api/public/whatsapp";
  return `${window.location.origin}/api/public/whatsapp`;
}
