/**
 * Resolves the person's own profile photo associated with their email address.
 * Uses the email's linked public profile image (Google/Gravatar), or Google's native letter initial badge.
 */
export function getEmailProfilePhoto(email: string, customImage?: string): string {
  if (customImage && customImage.trim() !== '') {
    return customImage;
  }

  if (!email || !email.includes('@')) {
    return `https://ui-avatars.com/api/?name=User&background=00b53f&color=fff&size=128&bold=true`;
  }

  const cleanEmail = email.trim().toLowerCase();
  // unavatar queries the account photo registered to this exact email address
  return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail.split('@')[0])}&background=0f2744&color=fff&size=128&bold=true`;
}

/**
 * Parses a Google Identity Services JWT credential token to extract
 * the user's authentic Google Account profile information, including their real picture.
 */
export function parseJwtGoogleCredential(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT credential', e);
    return null;
  }
}
