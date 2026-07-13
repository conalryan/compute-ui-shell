import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import "./compute-ui-loader";

@customElement("compute-ui-shell")
export class ComputeUiShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-height: 100svh;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
      color: CanvasText;
      background: Canvas;
    }

    .shell {
      display: flex;
      flex-direction: column;
      min-height: 100svh;
    }

    header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid color-mix(in srgb, CanvasText 12%, transparent);
    }

    header a {
      color: inherit;
      text-decoration: none;
      font-weight: 600;
    }

    header .meta {
      margin-left: auto;
      font-size: 0.8rem;
      opacity: 0.65;
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
  `;

  render() {
    console.log("redender compute-ui-shell");
    return html`
      <div class="shell">
        <header>
          <a href="/" @click=${this.onHomeClick}>Compute UI Shell</a>
        </header>
        <main>
          <compute-ui-loader></compute-ui-loader>
        </main>
      </div>
    `;
  }

  /** Programmatic navigation helper for shell chrome / future nav */
  private navigate(path: string) {
    const url = path.startsWith("/") ? path : `/${path}`;
    if (url === location.pathname) return;
    history.pushState(null, "", url);
  }

  private onHomeClick = (event: MouseEvent) => {
    event.preventDefault();
    this.navigate("/");
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "compute-ui-shell": ComputeUiShell;
  }
}
