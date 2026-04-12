type ValidationResult = {
  message: string;
  field: "name" | "email" | "password" | "confirmPassword";
} | null;

export function validateRegister(
  displayName: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult {
  const nameParts = displayName.trim().split(/\s+/);

  if (nameParts.length < 2) {
    return {
      message: "Vennligst oppgi fullt navn (fornavn og etternavn)",
      field: "name",
    };
  }

  if (!/[a-zA-ZæøåÆØÅ -]+$/.test(displayName.trim())) {
    return {
      message: "Navn kan kun inneholde bokstaver, mellomrom og bindestrek.",
      field: "name",
    };
  }

  if (!email) {
    return { message: "Vennligst oppgi en email", field: "email" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      message: "Vennligst oppgi en gyldig e-postadresse.",
      field: "email",
    };
  }

  if (!password) {
    return { message: "Vennligst oppgi et passord.", field: "password" };
  }

  if (password.length < 8) {
    return { message: "Passordet må minst være 8 tegn", field: "password" };
  }

  if (!/[a-zA-ZæøåÆØÅ]/.test(password)) {
    return {
      message: "Passordet må inneholde minst en bokstav",
      field: "password",
    };
  }

  if (!confirmPassword) {
    return { message: "Vennligst genta passordet.", field: "confirmPassword" };
  }

  if (password !== confirmPassword) {
    return { message: "Passordene stemmer ikke.", field: "confirmPassword" };
  }

  return null;
}
