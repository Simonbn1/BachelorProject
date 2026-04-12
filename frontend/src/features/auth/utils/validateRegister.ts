export function validateRegister(
  displayName: string,
  email: string,
  password: string,
  confirmPassword: string,
): string | null {
  const nameParts = displayName.trim().split(/\s+/);

  if (nameParts.length < 2) {
    return "Vennligst oppgi fullt navn (fornavn og etternavn)";
  }

  if (!/[a-zA-ZæøåÆØÅ -]+$/.test(displayName.trim())) {
    return "Navn kan kun inneholde bokstaver, mellomrom og bindestrek.";
  }

  if (!email) {
    return "Vennligst oppgi en email";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Vennligst oppgi en gyldig e-postadresse.";
  }

  if (!password) {
    return "Vennligst oppgi et passord.";
  }

  if (password.length < 8) {
    return "Passordet må minst være 8 tegn";
  }

  if (!/[a-zA-ZæøåÆØÅ]/.test(password)) {
    return "Passordet må inneholde minst en bokstav";
  }

  if (!confirmPassword) {
    return "Vennligst genta passordet.";
  }

  if (password !== confirmPassword) {
    return "Passordene stemmer ikke.";
  }

  return null;
}
