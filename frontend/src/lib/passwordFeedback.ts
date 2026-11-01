const MIN_PASSWORD_CHARACTERS = 12;
const MAX_PASSWORD_UTF8_BYTES = 72;

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function getPasswordFeedback(password: string, confirmation: string) {
  const characterCount = Array.from(password).length;
  const utf8Bytes = new TextEncoder().encode(password).length;
  const characterVariety = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;
  let strengthScore = 0;

  if (characterCount >= 8) strengthScore = 1;
  if (characterCount >= MIN_PASSWORD_CHARACTERS) strengthScore = 2;
  if (characterCount >= 16) strengthScore = 3;
  if (characterCount >= 20) strengthScore = 4;
  if (characterVariety >= 3) strengthScore += 1;
  if (characterVariety === 4) strengthScore += 1;
  strengthScore = Math.min(strengthScore, 5);

  const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Strong"];
  const requirements: Record<string, PasswordRequirement> = {
    minimumLength: {
      label: `At least ${MIN_PASSWORD_CHARACTERS} characters`,
      met: characterCount >= MIN_PASSWORD_CHARACTERS,
    },
    maximumBytes: {
      label: `No more than ${MAX_PASSWORD_UTF8_BYTES} UTF-8 bytes`,
      met: password.length > 0 && utf8Bytes <= MAX_PASSWORD_UTF8_BYTES,
    },
    matches: {
      label: "Passwords match",
      met: Boolean(confirmation) && password === confirmation,
    },
  };

  return {
    characterCount,
    utf8Bytes,
    requirements,
    strength: {
      score: strengthScore,
      maximum: 5,
      label: password ? strengthLabels[strengthScore] : "Enter a password",
    },
  };
}
