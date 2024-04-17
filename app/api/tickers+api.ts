import { ExpoRequest, ExpoResponse } from "expo-router/server";

export async function GET(request: ExpoRequest) {
  const ticker = request.expoUrl.searchParams.get('symbol') || "btc";
  const name = request.expoUrl.searchParams.get('name') || "bitcoin";
  
  const url = `https://api.coinpaprika.com/v1/tickers/${encodeURIComponent(ticker.toLowerCase())}-${encodeURIComponent(name.toLowerCase())}/historical?start=2024-01-01&interval=1d`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  }

  const res = await response.json();
  return ExpoResponse.json(res);
}
