const crypto = require("crypto");
require("dotenv").config(); // Use if you store keys in .env files for security

// Ensure the key is 32 bytes (256 bits) using SHA-256
const SECRET_KEY = crypto.createHash('sha256').update( process.env.SECRET_KEY || "Shani Staretz").digest();


// Function to encrypt password
const encryptPassword = (password) => {
  
  const iv = crypto.randomBytes(16); // Initialization Vector

  //Creates and returns a Cipher object, with the given algorithm, key and initialization vector (iv).
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "hex"),
    iv
  );

  let encryptedPassword = cipher.update(password, "utf8", "hex");
  encryptedPassword += cipher.final("hex");
  return iv.toString("hex") + ":" + encryptedPassword;
};

// Function to decrypt password
const decryptPassword = (encryptedPassword) => {
  
  const [ivHex, encryptedText] = encryptedPassword.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY, "hex"),
    iv
  );

  let decryptedPassword = decipher.update(encryptedText, "hex", "utf8");
  decryptedPassword += decipher.final("utf8");
  return decryptedPassword;
};

module.exports = { encryptPassword, decryptPassword };
