import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
        title: 'Project VARUNA | Automated River Water Quality Intelligence'
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'features/:id',
        loadComponent: () => import('./pages/features/feature-detail.component').then(m => m.FeatureDetailComponent)
      },
      {
        path: 'case-studies',
        loadComponent: () => import('./pages/case-studies/case-studies.component').then(m => m.CaseStudiesComponent)
      },
      {
        path: 'blog',
        loadComponent: () => import('./pages/blog/blog-list.component').then(m => m.BlogListComponent)
      },
      {
        path: 'blog/:slug',
        loadComponent: () => import('./pages/blog/blog-detail.component').then(m => m.BlogDetailComponent)
      },
      {
        path: 'faq',
        loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'thank-you',
        loadComponent: () => import('./pages/thank-you/thank-you.component').then(m => m.ThankYouComponent)
      },
      {
        path: 'privacy',
        loadComponent: () => import('./pages/legal/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'terms',
        loadComponent: () => import('./pages/legal/terms.component').then(m => m.TermsComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Live Telemetry Cockpit | Project VARUNA'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
