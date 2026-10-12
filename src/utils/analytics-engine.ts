import type { AppEnv } from "@/middleware/auth"

export interface AnalyticsEngineQueryResult<T = any> {
  data: T[]
  rows: number
}

export async function queryAnalyticsEngine<T = any>(
  env: AppEnv["Bindings"],
  sqlQuery: string
): Promise<AnalyticsEngineQueryResult<T>> {
  const accountId =
    (env as any).CF_ACCOUNT_ID || (env as any).CLOUDFLARE_ACCOUNT_ID
  const apiToken =
    (env as any).CF_API_TOKEN || (env as any).CLOUDFLARE_API_TOKEN

  if (!accountId || !apiToken) {
    console.warn(
      "[Analytics Engine] CF_ACCOUNT_ID or CF_API_TOKEN is missing. Skipping SQL query."
    )
    return { data: [], rows: 0 }
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "text/plain",
    },
    body: sqlQuery,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Analytics Engine SQL query failed [${response.status}]: ${errorText}`
    )
  }

  const json = (await response.json()) as AnalyticsEngineQueryResult<T>
  return json
}
