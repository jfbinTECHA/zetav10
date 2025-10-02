# 🚀 GitOps Deployment Guide - QA Platform

## Overview

This directory contains GitOps configurations for automated deployment of the QA Platform using ArgoCD. The platform supports multi-environment deployments (dev/staging/prod) with automated synchronization and drift detection.

## 📋 Prerequisites

- **ArgoCD** installed in your cluster
- **Git repository** accessible to ArgoCD
- **Kubernetes cluster** with required permissions
- **Helm** (for local testing)

## 🏗️ Quick Start

### 1. Add Repository to ArgoCD

```bash
# Add your Git repository to ArgoCD
argocd repo add https://github.com/your-org/qa-platform \
  --name qa-platform \
  --username <your-username> \
  --password <your-token>
```

### 2. Create ArgoCD Project

```bash
# Create project for QA platform
argocd proj create qa-platform \
  --dest https://kubernetes.default.svc,qa-* \
  --src https://github.com/your-org/qa-platform \
  --allow-cluster-resource \
  --allow-namespaced-resource
```

### 3. Deploy Applications

```bash
# Deploy single environment (development)
kubectl apply -f gitops/argocd-application.yaml

# Or deploy multi-environment ApplicationSet
kubectl apply -f gitops/argocd-application-multienv.yaml
```

### 4. Verify Deployment

```bash
# Check ArgoCD applications
argocd app list

# Check sync status
argocd app get qa-platform

# View in ArgoCD UI
# Access: https://argocd.your-domain.com
```

## 🏢 Multi-Environment Strategy

### Environment Configuration

| Environment | Purpose | Security | Resources | Sync Policy |
|-------------|---------|----------|-----------|-------------|
| **dev** | Development & testing | Minimal | Low | Auto-sync |
| **staging** | Pre-production validation | Moderate | Medium | Auto-sync |
| **prod** | Production deployment | Maximum | High | Manual approval |

### Environment-Specific Values

- **`values-dev.yaml`**: Fast iteration, minimal security
- **`values-staging.yaml`**: Production-like testing
- **`values-prod.yaml`**: Full security, HA, enterprise features

## 🔄 Sync Policies

### Automated Sync (Dev/Staging)
```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
  syncOptions:
    - CreateNamespace=true
```

### Manual Approval (Production)
```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: false
```

## 📊 Monitoring GitOps Health

### ArgoCD Application Health
```bash
# Check application health
argocd app get qa-platform-prod --show-operation

# View sync history
argocd app history qa-platform-prod

# Check for drift
argocd app diff qa-platform-prod
```

### Prometheus Metrics (Optional)
```yaml
# ArgoCD metrics
argocd_app_info{app="qa-platform", namespace="argocd"}
argocd_app_sync_status{app="qa-platform"}
```

## 🚨 Troubleshooting

### Common Issues

#### Application Not Syncing
```bash
# Check ArgoCD logs
kubectl logs -n argocd deployment/argocd-server

# Check application events
kubectl describe application qa-platform -n argocd

# Force sync
argocd app sync qa-platform
```

#### Repository Access Issues
```bash
# Update repository credentials
argocd repo update qa-platform

# Test repository access
argocd repo list
```

#### Helm Chart Issues
```bash
# Test Helm template locally
helm template qa-platform ./helm-chart -f helm-chart/values-prod.yaml

# Check for validation errors
helm lint ./helm-chart
```

### Drift Detection & Correction

ArgoCD automatically detects configuration drift:

```bash
# Check for drift
argocd app diff qa-platform-prod

# Sync to correct drift
argocd app sync qa-platform-prod

# Enable self-healing
argocd app set qa-platform-prod --self-heal
```

## 🔧 Advanced Configuration

### Custom Sync Waves
```yaml
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"
```

### Resource Hooks
```yaml
metadata:
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
```

### Selective Sync
```yaml
syncPolicy:
  syncOptions:
    - ServerSideApply=true
    - PrunePropagationPolicy=foreground
```

## 📈 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy QA Platform
on:
  push:
    branches: [main]
    paths: ['helm-chart/**', 'gitops/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to ArgoCD
        run: |
          argocd app sync qa-platform-dev
          argocd app wait qa-platform-dev
```

### Automated Testing
```yaml
# Pre-deployment validation
- name: Test Helm Chart
  run: |
    helm lint ./helm-chart
    helm template test ./helm-chart > /dev/null

- name: Validate ArgoCD Manifests
  run: |
    kubectl apply -f gitops/ --dry-run=client
```

## 🔐 Security Considerations

### Repository Access
- Use **personal access tokens** instead of passwords
- **Rotate credentials** regularly
- **Limit repository permissions** to read-only where possible

### RBAC Configuration
```yaml
# ArgoCD RBAC for QA team
p, role:qa-developer, applications, sync, qa-platform/dev
p, role:qa-admin, applications, *, qa-platform/*
```

### Network Policies
Ensure ArgoCD can reach your Git repository and Kubernetes API.

## 📚 Best Practices

### Repository Structure
```
qa-platform/
├── helm-chart/          # Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-staging.yaml
│   └── values-prod.yaml
├── gitops/             # ArgoCD manifests
│   ├── argocd-application.yaml
│   └── README.md
└── docs/               # Documentation
```

### Branch Strategy
- **`main`**: Production-ready code
- **`develop`**: Integration branch
- **Feature branches**: Individual features
- **Release branches**: Version-specific releases

### Version Management
- Use **semantic versioning** for releases
- **Tag releases** in Git for ArgoCD targeting
- **Pin versions** in production environments

## 🎯 Success Metrics

### Deployment Success
- ✅ **Zero-touch deployments** across environments
- ✅ **Automated drift correction**
- ✅ **Consistent configurations** via Git

### Operational Excellence
- ✅ **Fast recovery** from configuration drift
- ✅ **Audit trails** for all changes
- ✅ **Rollback capability** to previous versions

### Team Productivity
- ✅ **Self-service deployments** for developers
- ✅ **Automated testing** in CI/CD pipelines
- ✅ **Environment parity** across dev/staging/prod

---

## 🚀 **GitOps Success: "Deploy Once, Update Forever"**

With GitOps enabled, your QA platform becomes:

- **📦 Self-deploying** - No manual Helm commands
- **🔄 Auto-updating** - Syncs automatically with Git changes
- **🛡️ Drift-proof** - Automatically corrects configuration drift
- **📊 Auditable** - Complete history of all changes
- **👥 Collaborative** - Teams work together via Git workflows

**Your QA platform now deploys itself and stays in sync forever!** 🎉