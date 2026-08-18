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

/** 팀/대기열 리스트 복사 — 제목 다음 줄부터 이름 한 줄씩 */
export function formatMemberList(
  title: string,
  members: Array<{ name: string; skillLabel?: string }>,
): string {
  if (members.length === 0) {
    return `${title}:\n(인원 없음)`;
  }

  const names = members.map((member) => member.name).join('\n');
  return `${title}:\n${names}`;
}

/** 전체 명단 공유용 — 이름만 줄바꿈으로 연결 */
export function formatRosterNames(names: string[]): string {
  return names.map((name) => name.trim()).filter(Boolean).join('\n');
}
