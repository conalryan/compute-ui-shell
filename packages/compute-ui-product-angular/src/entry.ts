import "@angular/compiler";
import {
  ApplicationRef,
  Component,
  InjectionToken,
  createComponent,
  inject,
  provideZonelessChangeDetection,
} from "@angular/core";
import { APP_BASE_HREF } from "@angular/common";
import { createApplication } from "@angular/platform-browser";

const BASE_PATH = new InjectionToken<string>("BASE_PATH");

@Component({
  selector: "compute-ui-product-angular-root",
  standalone: true,
  template: `
    <div class="card">
      <span class="badge">Angular</span>
      <h1>Product Angular</h1>
      <p>
        Imperative <code>mount</code> example for
        <code>compute-ui-product-angular</code>.
      </p>
      <p>Router basename: <code>{{ basePath }}</code></p>
    </div>
  `,
  styles: [
    `
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
        background: color-mix(in srgb, #dd0031 16%, transparent);
        color: #dd0031;
      }

      @media (prefers-color-scheme: dark) {
        .badge {
          background: color-mix(in srgb, #ff5a7a 22%, transparent);
          color: #ff5a7a;
        }
      }
    `,
  ],
})
class AppComponent {
  basePath = inject(BASE_PATH);
}

type MountContext = {
  appName: string;
  basePath: string;
  entryUrl: string;
};

/**
 * Option B — imperative mount that bootstraps Angular into the shell outlet.
 * Uses JIT (`@angular/compiler`) so Vite can emit a single entry.js without AOT.
 */
export async function mount(
  container: HTMLElement,
  context: MountContext,
) {
  const app = await createApplication({
    providers: [
      provideZonelessChangeDetection(),
      { provide: APP_BASE_HREF, useValue: context.basePath },
      { provide: BASE_PATH, useValue: context.basePath },
    ],
  });

  const appRef = app.injector.get(ApplicationRef);
  const host = document.createElement("compute-ui-product-angular-root");
  container.replaceChildren(host);

  const componentRef = createComponent(AppComponent, {
    environmentInjector: appRef.injector,
    hostElement: host,
  });
  appRef.attachView(componentRef.hostView);
  componentRef.changeDetectorRef.detectChanges();

  return () => {
    componentRef.destroy();
    app.destroy();
  };
}
