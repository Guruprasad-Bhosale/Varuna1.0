import React from 'react';
import SensorMetricCard from './SensorMetricCard';

const PARAMETERS_CONFIG = [
  {
    id: 'ph',
    title: 'pH Level',
    unit: 'pH',
    precision: 2,
    maxScale: 14.0,
    baselineText: '6.5 – 8.5 pH',
    sensorName: 'Industrial Glass pH Electrode',
    sensorModel: 'E-201-C BNC Probe',
    principle: 'Electrochemical potential across glass hydrogen-ion membrane',
    placement: 'Intake Chamber (Submerged)',
    calibration: '2-Point Standard Buffer (pH 4.01 / 7.00)'
  },
  {
    id: 'turbidity_ntu',
    title: 'Turbidity (Clarity)',
    unit: 'NTU',
    precision: 0,
    maxScale: 100,
    baselineText: '≤ 10 NTU',
    sensorName: 'Optical Turbidity Sensor',
    sensorModel: 'TS-300B Infrared Module',
    principle: '90° Light scattering at 940nm IR wavelength',
    placement: 'Optical Screen Chamber',
    calibration: 'Formazin 0–1000 NTU approximation curve'
  },
  {
    id: 'ec_us_cm',
    title: 'Conductivity (EC)',
    unit: 'µS/cm',
    precision: 0,
    maxScale: 2500,
    baselineText: '≤ 600 µS/cm',
    sensorName: 'Analog EC / TDS Sensor',
    sensorModel: 'Platinum K=1.0 Probe',
    principle: 'Alternating AC ionic solution conductance',
    placement: 'Secondary Chamber Well',
    calibration: '1413 µS/cm KCl reference standard with 2%/°C temp comp'
  },
  {
    id: 'temperature_c',
    title: 'Water Temperature',
    unit: '°C',
    precision: 1,
    maxScale: 50.0,
    baselineText: '18.0 – 28.0 °C',
    sensorName: 'Digital Temperature Sensor',
    sensorModel: 'Dallas DS18B20 (Waterproof)',
    principle: 'Direct digital silicon bandgap thermal measurement',
    placement: 'Primary Intake Manifold',
    calibration: 'Factory calibrated ±0.5°C from -10°C to +85°C'
  },
  {
    id: 'particle_count',
    title: 'Optical Particulates',
    unit: 'count',
    precision: 0,
    maxScale: 600,
    baselineText: '≤ 100 particles',
    sensorName: 'Pi Camera Module v3',
    sensorModel: 'Sony IMX708 HDR (12MP)',
    principle: 'Computer Vision contour extraction under darkfield LED ring',
    placement: 'Acrylic Optical Chamber Shroud',
    calibration: 'Adaptive Gaussian threshold with min 6px noise filter'
  },
  {
    id: 'avg_particle_size_mm',
    title: 'Avg Particle Size',
    unit: 'mm',
    precision: 3,
    maxScale: 2.5,
    baselineText: '≤ 0.60 mm',
    sensorName: 'Morphological Segmentation Engine',
    sensorModel: 'OpenCV Edge Processing',
    principle: 'Equivalent circular diameter from calibrated pixel ratio',
    placement: 'Raspberry Pi 4 Edge Gateway',
    calibration: '1 px = 0.045 mm spatial optical calibration factor'
  }
];

export default function SensorMetricGrid({ latestData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PARAMETERS_CONFIG.map((config) => (
        <SensorMetricCard
          key={config.id}
          config={config}
          value={latestData?.[config.id]}
        />
      ))}
    </div>
  );
}
