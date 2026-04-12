export function validateLogin(email: string, password: string): string | null {
  if (!email) {
    return "Vennligst oppgi en e-postadresse.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Vennligst oppgi en gyldig e-postadresse.";
  }

  if (!password) {
    return "Vennligst oppgi et passord.";
  }

  return null;
}
