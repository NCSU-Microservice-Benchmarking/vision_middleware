# Middleware - Microservice Benchmarking

**A middleware orchestrating microservices for video anonymization, leveraging Kafka for communication and Docker multi-stage build for deployment.**

## Overview

This repository contains the middleware and microservices that comprise a benchmark for video anonymization. The system aims to anonymize individuals within videos while preserving privacy.

## Units

* **Latent Generation Unit:**
    - Generates random latent images for anonymization.
    - Stores latents in a key-value database with expiration.
* **Pose-Latent Combination Unit:**
    - Combines pose estimation tags and segmentation binary masks.
    - Stores intermediate results in caches for efficient processing.
* **Segment-New Instance Combination Unit:**
    - Similar to the Pose-Latent Combination Unit.
    - Handles additional data types for instance replacement.

## Installation

Node.js:

```bash
./install.sh node
```

Go:

```bash
./install.sh go
```

## Run

Node.js:

```bash
./run.sh node
```

Go:

```bash
./run.sh go
```