export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function formatMemberList(
  title: string,
  members: Array<{ name: string; skillLabel?: string }>,
): string {
  if (members.length === 0) {
    return `${title}: (인원 없음)`;
  }

  const names = members.map((member) => member.name).join(', ');
  return `${title}: ${names}`;
}
