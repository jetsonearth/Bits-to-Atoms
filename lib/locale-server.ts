import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from "./i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const val = cookieStore.get(LOCALE_COOKIE)?.value;
  if (val === "en" || val === "zh") return val;
  return DEFAULT_LOCALE;
}
