import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaJson?: object;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  updateMetaTags(config: SeoConfig): void {
    // 1. Set Title
    const fullTitle = `${config.title} | Project JalDrishti Environmental Intelligence`;
    this.titleService.setTitle(fullTitle);

    // 2. Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    // 3. OpenGraph / Twitter Cards
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:image', content: config.ogImage || '/assets/images/jaldrishti-og-banner.webp' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    // 4. Dynamic Canonical Tag
    if (config.canonicalUrl) {
      let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = this.document.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.document.head.appendChild(link);
      }
      link.setAttribute('href', config.canonicalUrl);
    }

    // 5. Schema.org JSON-LD
    if (config.schemaJson) {
      let script: HTMLScriptElement | null = this.document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = this.document.createElement('script');
        script.type = 'application/ld+json';
        this.document.head.appendChild(script);
      }
      script.text = JSON.stringify(config.schemaJson);
    }
  }
}
