export const time = (n: number) =>
  `${Math.floor(n / 60000)}분 ${Math.floor(n / 1000) % 60}초`;
export const date = (n: number) =>
  new Date(n).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
