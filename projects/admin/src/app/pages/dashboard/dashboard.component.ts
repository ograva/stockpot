import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  NgApexchartsModule,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexDataLabels,
  ApexLegend,
} from 'ng-apexcharts';
import { MaterialModule } from 'src/app/material.module';
import { TenantService, TenantRow } from 'src/app/services/tenant.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MaterialModule, RouterModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private tenantService = inject(TenantService);

  tenants = signal<TenantRow[]>([]);
  isLoading = signal(true);

  activeCount = computed(
    () => this.tenants().filter((t) => t.status === 'active').length,
  );
  suspendedCount = computed(
    () => this.tenants().filter((t) => t.status === 'suspended').length,
  );

  recentTenants = computed(() =>
    [...this.tenants()]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? '').getTime() -
          new Date(a.createdAt ?? '').getTime(),
      )
      .slice(0, 5),
  );

  tierCounts = computed(() => {
    const all = this.tenants();
    return {
      starter: all.filter((t) => t.planTier === 'starter').length,
      growth: all.filter((t) => t.planTier === 'growth').length,
      enterprise: all.filter((t) => t.planTier === 'enterprise').length,
    };
  });

  // ApexCharts donut configuration
  chartSeries = computed<ApexNonAxisChartSeries>(() => {
    const tc = this.tierCounts();
    return [tc.starter, tc.growth, tc.enterprise];
  });

  chartLabels = ['Starter', 'Growth', 'Enterprise'];

  chartConfig: ApexChart = {
    type: 'donut',
    height: 260,
    toolbar: { show: false },
  };

  chartDataLabels: ApexDataLabels = { enabled: true };

  chartLegend: ApexLegend = { position: 'bottom' };

  ngOnInit(): void {
    this.tenantService.getAll().subscribe({
      next: (rows) => {
        this.tenants.set(rows);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
