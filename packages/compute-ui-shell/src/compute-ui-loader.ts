import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";

import { appNameFromPath } from "./app-loader/app-id";
import { loadAndMountApp, unmountApp } from "./app-loader/app-loader";
import { APPS_BASE_URL } from "./app-loader/config";
import type { LoadedApp } from "./app-loader/types";

@customElement("compute-ui-loader")
export class ComputeUiLoader extends LitElement {
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

    .panel {
      margin: auto;
      padding: 2rem 1.5rem;
      max-width: 36rem;
      text-align: center;
    }

    .panel code {
      font-size: 0.9em;
    }

    .status {
      padding: 1rem 1.25rem;
      font-size: 0.95rem;
      opacity: 0.8;
    }

    .error {
      color: #b42318;
      padding: 1rem 1.25rem;
    }

    @media (prefers-color-scheme: dark) {
      .error {
        color: #f97066;
      }
    }

    #outlet {
      flex: 1;
      display: block;
      min-height: 0;
    }

    #outlet:empty {
      display: none;
    }
  `;

  @state() private appName: string | null = null;
  @state() private loading = false;
  @state() private error: string | null = null;

  private outletRef = createRef<HTMLDivElement>();
  private loaded: LoadedApp | null = null;
  private loadGeneration = 0;

  connectedCallback() {
    super.connectedCallback();
    void this.syncFromLocation();
    window.addEventListener("popstate", this.onPopState);
  }

  disconnectedCallback() {
    window.removeEventListener("popstate", this.onPopState);
    void this.teardown();
    super.disconnectedCallback();
  }

  private onPopState = () => {
    void this.syncFromLocation();
  };

  private async teardown() {
    const outlet = this.outletRef.value;
    if (outlet) {
      await unmountApp(this.loaded, outlet);
    }
    this.loaded = null;
  }

  private async syncFromLocation() {
    const nextName = appNameFromPath(location.pathname);
    const generation = ++this.loadGeneration;

    await this.teardown();

    // While await this.teardown() is in flight, another syncFromLocation()
    // (e.g. popstate or navigate) can run and bump this.loadGeneration again
    if (generation !== this.loadGeneration) return;

    this.appName = nextName;
    this.error = null;

    if (!nextName) {
      this.loading = false;
      return;
    }

    this.loading = true;
    // Wait for the outlet to exist in the light/shadow tree after re-render
    await this.updateComplete;

    // While await this.updateComplete is in flight, another syncFromLocation()
    // (e.g. popstate or navigate) can run and bump this.loadGeneration again
    if (generation !== this.loadGeneration) return;

    const outlet = this.outletRef.value;
    if (!outlet) {
      this.loading = false;
      this.error = "Shell outlet is missing.";
      return;
    }

    try {
      this.loaded = await loadAndMountApp(nextName, outlet);
      if (generation !== this.loadGeneration) {
        await unmountApp(this.loaded, outlet);
        this.loaded = null;
        return;
      }
    } catch (err) {
      console.error(err);
      if (generation !== this.loadGeneration) return;
      outlet.replaceChildren();
      this.error = err instanceof Error ? err.message : `Failed to load ${nextName}`;
      this.loaded = null;
    } finally {
      if (generation === this.loadGeneration) {
        this.loading = false;
      }
    }
  }

  render() {
    console.log("redender compute-ui-loader");
    return html`
      <div class="shell">
          ${this.renderBody()}
          <div id="outlet" ${ref(this.outletRef)}></div>
      </div>
    `;
  }

  private renderBody() {
    if (!this.appName) {
      return html`
        <div class="panel">
          <h1>Compute UI Shell</h1>
          <p>
            Open a product route to load an application via Akamai CDN,
            e.g. <code>/product-a</code> →
            <code>${APPS_BASE_URL}/compute-ui-product-a/deploy.json</code>
          </p>
        </div>
      `;
    }

    if (this.loading) {
      return html`<p class="status">Loading ${this.appName}…</p>`;
    }

    if (this.error) {
      return html`<p class="error" role="alert">${this.error}</p>`;
    }

    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "compute-ui-loader": ComputeUiLoader;
  }
}
