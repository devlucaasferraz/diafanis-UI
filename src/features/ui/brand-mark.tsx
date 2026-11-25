import type { SVGProps } from 'react';

/** Pirâmide de três faces; os canais usam o fundo da superfície. */
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 90"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M47 3C40 3 36 9 31 18L5 65C2 70 1 74 3 77Q3.5 78 5 77L35 60C44 55 48 49 48 38V5Q48 3 47 3Z" />
      <path d="M53 3C60 3 64 9 69 18L95 65C98 70 99 74 97 77Q96.5 78 95 77L65 60C56 55 52 49 52 38V5Q52 3 53 3Z" />
      <path d="M8 80L39 63C46 59 54 59 61 63L92 80Q94 81 92 83C89 86 85 87 79 87H21C15 87 11 86 8 83Q6 81 8 80Z" />
    </svg>
  );
}
