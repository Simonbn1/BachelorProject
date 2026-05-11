import "../../../shared/context/ToastContext.tsx";

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
  const trimmedName = displayName.trim();
  const nameParts = trimmedName.split(/\s+/);

  if (nameParts.length < 2) {
    return {
      message: "Vennligst oppgi fullt navn (fornavn og etternavn).",
      field: "name",
    };
  }

  if (!/^[a-zA-ZæøåÆØÅ -]+$/.test(trimmedName)) {
    return {
      message: "Navn kan kun inneholde bokstaver, mellomrom og bindestrek.",
      field: "name",
    };
  }

  if (!email.trim()) {
    return {
      message: "Vennligst oppgi en e-postadresse.",
      field: "email",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      message: "Vennligst oppgi en gyldig e-postadresse.",
      field: "email",
    };
  }

  if (!password) {
    return {
      message: "Vennligst oppgi et passord.",
      field: "password",
    };
  }

  if (password.length < 8) {
    return {
      message: "Passordet må være minst 8 tegn.",
      field: "password",
    };
  }

  if (!/[a-zA-ZæøåÆØÅ]/.test(password)) {
    return {
      message: "Passordet må inneholde minst én bokstav.",
      field: "password",
    };
  }

  if (!/\d/.test(password)) {
    return {
      message: "Passordet må inneholde minst ett tall.",
      field: "password",
    };
  }

  if (!confirmPassword) {
    return {
      message: "Vennligst gjenta passordet.",
      field: "confirmPassword",
    };
  }

  if (password !== confirmPassword) {
    return {
      message: "Passordene stemmer ikke.",
      field: "confirmPassword",
    };
  }

  return null;
}
