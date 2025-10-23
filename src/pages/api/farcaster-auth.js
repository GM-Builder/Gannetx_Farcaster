// pages/api/farcaster-auth.js
export default async function handler(req, res) {
  try {
    // gunakan endpoint yang diizinkan CSP
    const response = await fetch("https://client.farcaster.xyz/nonce", {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch nonce from Farcaster client",
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to connect to Farcaster client",
    });
  }
}
