import { v4 as uuidv4 } from "uuid";
import { SignJWT } from "jose";
import { ObjectId } from "bson";

const createGuestToken = async () => {
  //   const guestId = uuidv4(); // Generate a unique guest ID
  const guestId = new ObjectId();

  const guestEmail = `guest-${guestId}@example.com`; // Dummy email for guest
  if (!import.meta.env.VITE_JWT_SECRET) {
    throw Error("no VITE_JWT_SECRET present");
  }
  const secret = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET); // Encode the secret

  const token = await new SignJWT({
    // id: guestId,
    id: guestId.toString(),
    email: guestEmail,
    isGuest: true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  localStorage.setItem("token", token); // Store token in localStorage
  return token;
};

// Example usage
export const getToken = async () =>
  localStorage.getItem("token") || (await createGuestToken());
