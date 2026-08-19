import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Cpu, HardDrive, Wifi, Thermometer } from 'lucide-angular';

@Component({
  selector: 'app-device-health',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './device-health.component.html',
  styleUrls: ['./device-health.component.css']
})
export class DeviceHealthComponent {
  readonly CpuIcon = Cpu;
  readonly HardDriveIcon = HardDrive;
  readonly WifiIcon = Wifi;
  readonly ThermometerIcon = Thermometer;
}
