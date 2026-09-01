import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-mission',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbsComponent],
  templateUrl: './mission.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Mission Storybook: Guardians of the Estuary | Project SagarDrishti',
      description: 'Discover how solar edge buoys, ISRO EOS-06 satellite data, and XGBoost AI are ending delayed water sampling across Maharashtra coastline.',
      canonicalUrl: 'https://sagardrishti.org/mission'
    });
  }
}
