export function validateRegister(
  displayName: string,
  password: string,
  confirmPassword: string,
): string | null {
  const nameParts = displayName.trim().split(/\s+/);
  if (nameParts.length < 2) {
    return "Vennligst oppgi fullt navn (fornavn og etternavn)";
  }

  if (!/[a-zA-ZæøåÆØÅ]/.test(displayName.trim())) {
    return "Navn kan kun innneholde bokstaver, mellomrom og bindestrek.";
  }

  if (password.length < 8) {
    return "Passordet må minst være 8 tegn";
  }

  if (password !== confirmPassword) {
    return "Passordene stemmer ikke.";
  }

  if (!/[a-zA-ZæøåÆØÅ]/.test(password)) {
    return "Passordet må inneholde minst en bokstaver";
  }

  return null;
}
