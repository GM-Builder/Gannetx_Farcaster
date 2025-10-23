export default async function handler(req, res) {
  try {
    const response = await fetch("https://auth.farcaster.xyz/nonce");
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Proxy failed:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
}
