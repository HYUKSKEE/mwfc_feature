/** 사용자가 직접 입력한 콤마/띄어쓰기/줄바꿈 구분 명단을 파싱합니다. */
export function parseTypedNames(raw: string): string[] {
  const chunks = raw
    .split(/[\n\r,，、\s]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const name of chunks) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }

  return unique;
}

/** OCR/텍스트 명단에서 선수 이름 후보를 뽑습니다. */
export function parseRosterText(raw: string): string[] {
  const chunks = raw
    .split(/[\n\r,，、|·•/\t]+/)
    .map((chunk) => cleanNameCandidate(chunk))
    .filter((name): name is string => Boolean(name));

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const name of chunks) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }

  return unique;
}

function cleanNameCandidate(value: string): string | null {
  let text = value.trim();
  if (!text) return null;

  // 앞쪽 번호/불릿 제거: "1.", "2)", "-", "①" 등
  text = text.replace(/^[\d①②③④⑤⑥⑦⑧⑨⑩\.\)\-–—*]+/, '').trim();
  text = text.replace(/[^\uAC00-\uD7A3a-zA-Z\s]/g, '').trim();
  text = text.replace(/\s+/g, ' ');

  if (!text) return null;

  const hangulOnly = text.replace(/[^가-힣]/g, '');
  const lettersOnly = text.replace(/[^a-zA-Z]/g, '');

  // 한글 이름(2~6자) 또는 영문 이름(2자 이상)
  const looksKorean = hangulOnly.length >= 2 && hangulOnly.length <= 6;
  const looksEnglish = lettersOnly.length >= 2 && lettersOnly.length <= 20;

  if (!looksKorean && !looksEnglish) return null;

  // 너무 긴 문장성 텍스트 제외
  if (text.length > 20) return null;

  const noise = [
    '명단',
    '선수',
    '참석',
    '출석',
    '팀',
    '조',
    '대기',
    '인원',
    '실력',
    '이름',
    '날짜',
    '시간',
    '장소',
    'mwfc',
    'futsal',
    'team',
    'maker',
  ];

  if (noise.includes(text.toLowerCase()) || noise.includes(hangulOnly)) {
    return null;
  }

  return text;
}
