export default async function handler(req, res) {
  try {
    const response = await fetch("https://auth.farcaster.xyz/api/nonce", {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nonce from Farcaster: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error("❌ Proxy failed:", err);
    res.status(500).json({
      error: "Failed to fetch nonce from Farcaster client",
      details: err.message,
    });
  }
}
