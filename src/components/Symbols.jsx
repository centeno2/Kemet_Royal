export function WingedSun({ className = "", ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 108 45"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="54" cy="14" r="8" />
        <path d="M54 22v17m-7-9h14M43 13C31 16 14 10 3 5c4 13 16 22 36 21l8-6M65 13c12 3 29-3 40-8-4 13-16 22-36 21l-8-6" />
        <path d="M8 12c10 5 21 8 33 6M13 18c9 4 18 6 27 4M100 12c-10 5-21 8-33 6m28 0c-9 4-18 6-27 4M20 16l-1 5m9-2-1 5m9-5v6m52-9 1 5m-9-2 1 5m-9-5v6" />
      </g>
    </svg>
  );
}

export function Lotus({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 35C12 29 16 16 24 7c8 9 12 22 0 28Z" />
        <path d="M24 35C9 36 5 25 5 16c11 1 17 8 19 19Zm0 0c15 1 19-10 19-19-11 1-17 8-19 19ZM8 39h32M24 35v8" />
      </g>
    </svg>
  );
}

export function Sun({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.2">
        <circle cx="24" cy="24" r="9" />
        <path d="M24 2v9m0 26v9M2 24h9m26 0h9M8 8l7 7m18 18 7 7M8 40l7-7m18-18 7-7" />
      </g>
    </svg>
  );
}

export function Star({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 1c0 11-4 15-15 15 11 0 15 4 15 15 0-11 4-15 15-15C20 16 16 12 16 1Z"
        stroke="currentColor"
      />
    </svg>
  );
}
