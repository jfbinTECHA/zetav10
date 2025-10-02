# QA Dashboard - Kubernetes Helm Chart

Enterprise-grade deployment of the QA monitoring system to Kubernetes clusters with auto-scaling, high availability, and production security.

## 🚀 Quick Start

### Option 1: GitOps Deployment (Recommended)

For production deployments, use ArgoCD for automated, GitOps-native deployment:

```bash
# Prerequisites: ArgoCD installed in cluster

# 1. Add repository to ArgoCD
argocd repo add https://github.com/your-org/qa-platform \
  --name qa-platform

# 2. Create ArgoCD project
argocd proj create qa-platform \
  --dest https://kubernetes.default.svc,qa-* \
  --src https://github.com/your-org/qa-platform

# 3. Deploy via GitOps
kubectl apply -f ../gitops/argocd-application.yaml

# 4. Access dashboard
kubectl get ingress -n qa-monitoring
```

### Option 2: Direct Helm Installation

For development or testing:

```bash
# Install with default values
helm install qa-dashboard ./helm-chart

# Install with environment-specific values
helm install qa-dashboard-dev ./helm-chart \
  -f values-dev.yaml \
  -n qa-dev

# Install production with full security
helm install qa-dashboard-prod ./helm-chart \
  -f values-prod.yaml \
  -n qa-prod
```

### Access the Dashboard

```bash
# Get service URL
kubectl get svc qa-dashboard -n qa-monitoring

# Port forward for local access
kubectl port-forward svc/qa-dashboard 5000:5000 -n qa-monitoring

# Open in browser: http://localhost:5000
```

## 📋 Configuration

### Key Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of pod replicas | `2` |
| `image.repository` | Docker image repository | `qa-dashboard` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `ingress.enabled` | Enable ingress | `true` |
| `persistence.enabled` | Enable persistent storage | `true` |
| `autoscaling.enabled` | Enable HPA | `true` |

### Authentication
```yaml
secrets:
  dashboardUsername: "admin"
  dashboardPassword: "your-secure-password"
```

### Notification Webhooks
```yaml
secrets:
  slackWebhookUrl: "https://hooks.slack.com/services/YOUR/WEBHOOK"
  discordWebhookUrl: "https://discord.com/api/webhooks/YOUR/WEBHOOK"
  teamsWebhookUrl: "https://outlook.office.com/webhook/YOUR/WEBHOOK"
```

### Email Configuration
```yaml
secrets:
  smtpUsername: "your-email@gmail.com"
  smtpPassword: "your-app-password"
env:
  EMAIL_FROM: "qa@yourcompany.com"
  EMAIL_TO: "alerts@yourcompany.com"
```

## 🏗️ Architecture

### Components Deployed
- **Deployment**: Main application pods with auto-scaling
- **Service**: Load balancer for pod access
- **Ingress**: External access with SSL termination
- **ConfigMap**: Test configuration and settings
- **Secret**: Sensitive credentials and webhooks
- **PVC**: Persistent storage for logs and data
- **HPA**: Auto-scaling based on CPU/memory
- **NetworkPolicy**: Security rules for pod communication

### High Availability
- **Multi-zone deployment** across availability zones
- **Rolling updates** with zero downtime
- **Pod disruption budget** ensuring minimum availability
- **Health checks** for automatic pod recovery

### Security Features
- **Non-root containers** with restricted privileges
- **Read-only root filesystem** where possible
- **Network policies** limiting pod communication
- **Secret management** for sensitive data
- **RBAC** with minimal required permissions

## 📊 Monitoring & Scaling

### Auto-Scaling
The HPA automatically scales pods based on:
- CPU utilization (default: 70%)
- Memory utilization (default: 80%)
- Custom metrics (configurable)

### Resource Limits
```yaml
resources:
  limits:
    cpu: 500m
    memory: 1Gi
  requests:
    cpu: 100m
    memory: 256Mi
```

### Health Checks
- **Readiness Probe**: Ensures pod can accept traffic
- **Liveness Probe**: Restarts unhealthy pods
- **Startup Probe**: Handles slow-starting applications

## 🔧 Advanced Configuration

### Custom Domain with SSL
```yaml
ingress:
  enabled: true
  hosts:
    - host: qa.yourcompany.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: qa-dashboard-tls
      hosts:
        - qa.yourcompany.com
```

### External Database (Future)
```yaml
externalDatabase:
  enabled: true
  host: postgresql.namespace.svc.cluster.local
  database: qa_dashboard
  secretName: qa-db-secret
```

### Service Mesh Integration
```yaml
istio:
  enabled: true
  gateways:
    - qa-gateway
  virtualServices:
    - qa-dashboard
```

## 🚨 Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod status
kubectl get pods -l app.kubernetes.io/name=qa-dashboard

# View pod logs
kubectl logs -l app.kubernetes.io/name=qa-dashboard

# Check events
kubectl describe pod <pod-name>
```

#### Ingress Not Working
```bash
# Check ingress status
kubectl get ingress qa-dashboard

# Verify ingress controller
kubectl get pods -n ingress-nginx
```

#### Auto-scaling Not Working
```bash
# Check HPA status
kubectl get hpa qa-dashboard

# View scaling events
kubectl describe hpa qa-dashboard
```

#### Persistence Issues
```bash
# Check PVC status
kubectl get pvc qa-dashboard-data

# Verify storage class
kubectl get storageclass
```

## 📈 Performance Tuning

### Resource Optimization
```yaml
resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 200m
    memory: 512Mi
```

### Scaling Configuration
```yaml
autoscaling:
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 60
  targetMemoryUtilizationPercentage: 75
```

### Database Connection Pooling
```yaml
env:
  DB_POOL_SIZE: "10"
  DB_MAX_OVERFLOW: "20"
```

## 🔒 Security Best Practices

### Network Security
- Use network policies to restrict pod communication
- Enable mutual TLS with service mesh
- Configure firewall rules at cluster level

### Secret Management
- Use external secret managers (AWS Secrets Manager, Vault)
- Rotate secrets regularly
- Avoid storing secrets in Git

### Access Control
- Implement RBAC for Kubernetes resources
- Use OAuth2/JWT for application authentication
- Enable audit logging for security events

## 📊 Monitoring Integration

### Prometheus Metrics
```yaml
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    namespace: monitoring
    interval: 30s
```

### Grafana Dashboards
- Import pre-built QA dashboard
- Custom panels for test metrics
- Alert rules for failure thresholds

### Logging Aggregation
- Fluent Bit for log collection
- Elasticsearch for log storage
- Kibana for log visualization

## 🚀 CI/CD Integration

### GitOps Deployment
```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: qa-dashboard
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/qa-dashboard
    path: helm-chart
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: qa-monitoring
```

### Automated Testing
```yaml
# Pre-deployment validation
tests:
  enabled: true
  image: qa-dashboard:latest
  commands:
    - python -m pytest tests/
```

## 📚 API Reference

### Health Endpoints
- `GET /` - Main dashboard (requires auth)
- `GET /api/qa-data` - Current QA results
- `GET /api/status` - Application health status

### WebSocket Events
- `update` - Real-time QA data updates
- `status` - System status messages
- `notification` - Alert notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes to the Helm chart
4. Test with `helm template`
5. Submit a pull request

## 📄 License

This Helm chart is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review Kubernetes logs
- Verify Helm values configuration
- Test with `helm template` for validation

---

**🎯 Your QA monitoring system is now enterprise-ready for Kubernetes deployment!**

Deploy with confidence to any cloud provider or on-premises cluster with full high availability, auto-scaling, and production security features.