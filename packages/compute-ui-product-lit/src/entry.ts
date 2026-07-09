import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Option A — custom element whose tag matches the app name.
 * Shell creates: <compute-ui-product-lit base-path="/product-lit">
 */
@customElement("compute-ui-product-lit")
export class ComputeUiProductLit extends LitElement {
  @property({ attribute: "base-path" })
  basePath = "/product-lit";

  static styles = css`
    :host {
      display: block;
      padding: 2rem 1.5rem;
      font-family: system-ui, sans-serif;
      color: CanvasText;
    }

    .card {
      max-width: 36rem;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
    }

    p {
      margin: 0.35rem 0;
      opacity: 0.85;
      line-height: 1.5;
    }

    code {
      font-size: 0.9em;
    }

    .badge {
      display: inline-block;
      margin-bottom: 1rem;
      padding: 0.2rem 0.55rem;
      border-radius: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      background: color-mix(in srgb, #325cff 18%, transparent);
      color: #325cff;
    }

    @media (prefers-color-scheme: dark) {
      .badge {
        background: color-mix(in srgb, #8ea2ff 22%, transparent);
        color: #8ea2ff;
      }
    }
  `;

  render() {
    return html`
      <div class="card">
        <span class="badge">Lit</span>
        <h1>Product Lit</h1>
        <p>
          Custom-element example registered as
          <code>compute-ui-product-lit</code>.
        </p>
        <p>Router basename: <code>${this.basePath}</code></p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "compute-ui-product-lit": ComputeUiProductLit;
  }
}
