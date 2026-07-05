import jwt from "jsonwebtoken";

/**
 * Express middleware that verifies the shared HMAC JWT issued by the Java backend.
 * jjwt's signWith(key) picks the HMAC variant from the secret's length: a >=64-byte
 * shared secret yields HS512, a shorter one HS256 — so we accept both (both still
 * require the shared secret; this is not the HS/RS alg-confusion case).
 * On success attaches userId, userName and the raw token to the request.
 */
export function authMiddleware(secret) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing bearer token" });
    }
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, secret, { algorithms: ["HS256", "HS512"] });
      req.userId = payload.sub;
      req.userName = payload.name;
      req.token = token;
      next();
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
