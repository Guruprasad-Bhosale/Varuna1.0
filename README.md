# Project VARUNA

Automated river water quality monitoring and safety prediction platform designed for continuous environmental intelligence.

## Phase 1 Overview
Phase 1 focuses on scaffolding the core software architecture, generating synthetic datasets, and emulating hardware telemetry, prior to the deployment of physical IoT nodes.

## Repository Structure
- `/hardware/`: Firmware and CAD for ESP32 and related sensors (Future).
- `/edge/`: Edge computing logic, optical processing, and hardware emulation.
- `/ml/`: Machine learning models, synthetic data generation, and training pipelines.
- `/backend/`: FastAPI application, database schemas, and REST endpoints.
- `/dashboard/`: React-based frontend dashboard (Future).
- `/infra/`: Infrastructure as Code (Terraform) and deployment configurations (Future).

## Quickstart (Phase 1)
1. Install dependencies: `pip install -e .[dev]`
2. Generate synthetic data: `python ml/data_generator.py`
3. Run hardware emulation: `python edge/mock_telemetry.py --anomaly industrial_dump --interval 2`
# Varuna
# Varuna1.0
