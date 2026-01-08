// helpers/urlTemporal.js
import jwt from 'jsonwebtoken';

const SECRET = process.env.TEMP_URL_SECRET || 'clave_super_secreta';

/**
 * Genera una URL temporal firmada
 * @param {string} videoId - ID del video de YouTube
 * @param {string} userId - ID del usuario
 * @param {number} expiresIn - Tiempo de expiración en segundos (ej: 600 = 10 min)
 */

export function generarURLTemporal(videoId, userId, expiresIn = 600) {
  const token = jwt.sign(
    { videoId, userId },
    SECRET,
    { expiresIn }
  );

  return `${process.env.BACKEND_URL}/ver?token=${token}`;
}

/**
 * Valida el token y devuelve el videoId si es válido
 * @param {string} token - Token JWT recibido en la URL
 */
export function validarToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    console.log("Payload del token validado:", payload);
    console.log("Video ID del token validado:", payload.videoId);
    console.log("User ID del token validado:", payload.userId);
    return payload;
  } catch (err) {
    console.error("Error al validar el token:", err.message);
    return null; // Token inválido o expirado 
  }
}