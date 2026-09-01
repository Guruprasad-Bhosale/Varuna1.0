import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

export interface Creator {
  id: string;
  firstName: string;
  fullName: string;
  role: string;
  lead?: boolean;
  avatarText: string;
  gradient: string;
  skills: string[];
  githubUrl: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent implements OnInit {
  creators: Creator[] = [
    {
      id: 'guruprasad',
      firstName: 'Guruprasad',
      fullName: 'Guruprasad Bhosale',
      role: 'Lead & Full-Stack / IoT',
      lead: true,
      avatarText: 'GB',
      gradient: 'from-teal-500 to-emerald-600',
      skills: ['Embedded IoT', 'Angular 18', 'FastAPI'],
      githubUrl: 'https://github.com/Guruprasad-Bhosale'
    },
    {
      id: 'gayatri',
      firstName: 'Gayatri',
      fullName: 'Gayatri',
      role: 'GenAI & Cloud Dispatch',
      avatarText: 'G',
      gradient: 'from-indigo-500 to-violet-600',
      skills: ['Generative AI', 'Cloud APIs', 'FastAPI'],
      githubUrl: 'https://github.com/Gayatri0410'
    },
    {
      id: 'raj',
      firstName: 'Raj',
      fullName: 'Raj Jadhav',
      role: 'AI / Machine Learning',
      avatarText: 'RJ',
      gradient: 'from-amber-500 to-orange-600',
      skills: ['Machine Learning', 'PyTorch', 'XGBoost'],
      githubUrl: 'https://github.com/raajjadhav0519'
    },
    {
      id: 'vinit',
      firstName: 'Vinit',
      fullName: 'Vinit Adake',
      role: 'Satellite & Geospatial API',
      avatarText: 'VA',
      gradient: 'from-blue-500 to-cyan-600',
      skills: ['Remote Sensing', 'GIS Pipelines', 'Python'],
      githubUrl: 'https://github.com/vinitadake'
    },
    {
      id: 'rutika',
      firstName: 'Rutika',
      fullName: 'Rutika Jadhav',
      role: 'Product Strategy & Outreach',
      avatarText: 'RJ',
      gradient: 'from-rose-500 to-pink-600',
      skills: ['Product Strategy', 'Deployment', 'Outreach'],
      githubUrl: 'https://github.com/Ruthika781'
    }
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'The Builders | Project SagarDrishti',
      description: 'Meet the team of 5 engineers and architects building Project SagarDrishti.',
      canonicalUrl: 'https://sagardrishti.org/about'
    });
  }
}
