import type { CSSProperties } from "react";

type AppProps = {
  basename: string;
};

export function App({ basename }: AppProps) {
  return (
    <div style={styles.root}>
      <span style={styles.badge}>React</span>
      <h1 style={styles.title}>Product React</h1>
      <p style={styles.copy}>
        Imperative <code>mount</code> / <code>unmount</code> example for{" "}
        <code>compute-ui-product-react</code>.
      </p>
      <p style={styles.copy}>
        Router basename: <code>{basename}</code>
      </p>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: "block",
    padding: "2rem 1.5rem",
    fontFamily: "system-ui, sans-serif",
    color: "CanvasText",
    maxWidth: "36rem",
    margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    marginBottom: "1rem",
    padding: "0.2rem 0.55rem",
    borderRadius: "0.35rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    background: "color-mix(in srgb, #61dafb 22%, transparent)",
    color: "#0b6e8a",
  },
  title: {
    margin: "0 0 0.5rem",
    fontSize: "1.5rem",
  },
  copy: {
    margin: "0.35rem 0",
    opacity: 0.85,
    lineHeight: 1.5,
  },
};
