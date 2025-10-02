# QA Operator - Kubernetes-Native QA as Code

## Overview

The QA Operator extends Kubernetes with custom resources for declarative QA testing. It transforms QA workflows from imperative scripts to declarative Kubernetes resources that are automatically managed, scheduled, and executed.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              KUBERNETES QA OPERATOR ECOSYSTEM               │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   QATest    │    │  QASuite    │    │ QASchedule  │     │
│  │  (Individual │───▶│ (Test      │───▶│ (Cron       │     │
│  │   Tests)    │    │  Groups)    │    │  Jobs)      │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│           │                   │                   │         │
│           ▼                   ▼                   ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Operator  │    │   Jobs/     │    │ QAReport   │     │
│  │ Controller  │───▶│ CronJobs    │───▶│ (Results)  │     │
│  │             │    │             │    │             │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Custom Resources

### QATest
Individual API or service tests with full configuration options.

```yaml
apiVersion: qa.company.com/v1
kind: QATest
metadata:
  name: api-health-check
spec:
  endpoint: "https://api.company.com/health"
  method: GET
  expectedStatus: 200
  timeout: "30s"
  retries: 3
  interval: "60s"
```

### QASuite
Groups of tests that run together with orchestration options.

```yaml
apiVersion: qa.company.com/v1
kind: QASuite
metadata:
  name: critical-apis
spec:
  tests:
  - api-health-check
  - user-auth-test
  parallel: true
  failFast: false
  schedule: "*/10 * * * *"
```

### QASchedule
Cron-based scheduling for automated test execution.

```yaml
apiVersion: qa.company.com/v1
kind: QASchedule
metadata:
  name: nightly-regression
spec:
  schedule: "0 2 * * *"
  target:
    kind: QASuite
    name: critical-apis
```

### QAReport
Persistent test execution results and analytics.

```yaml
apiVersion: qa.company.com/v1
kind: QAReport
metadata:
  name: test-run-2024-01-01
status:
  phase: Completed
  summary:
    totalTests: 10
    passedTests: 9
    failedTests: 1
    successRate: 90.0
```

## Installation

### Prerequisites
- Kubernetes 1.19+
- kubectl configured
- Go 1.19+ (for building from source)

### Quick Install

```bash
# Install CRDs
kubectl apply -f operator/crds/

# Install operator
kubectl apply -f operator/deployment.yaml

# Verify installation
kubectl get crds | grep qa.company.com
kubectl get pods -n qa-system
```

### ArgoCD Integration

```yaml
# Add to your ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: qa-operator
spec:
  source:
    repoURL: https://github.com/your-org/qa-platform
    path: operator
  destination:
    server: https://kubernetes.default.svc
    namespace: qa-system
```

## Usage Examples

### Basic API Testing

```bash
# Create a simple health check
kubectl apply -f operator/examples/qa-as-code-examples.yaml

# Watch test execution
kubectl get qatests -w

# View test results
kubectl get qareports
```

### Advanced Scenarios

#### Load Testing
```yaml
apiVersion: qa.company.com/v1
kind: QASuite
metadata:
  name: load-test
spec:
  tests:
  - api-performance-test
  environment:
    LOAD_TEST: "true"
    CONCURRENT_USERS: "100"
```

#### End-to-End Testing
```yaml
apiVersion: qa.company.com/v1
kind: QASuite
metadata:
  name: user-journey
spec:
  tests:
  - user-registration
  - user-login
  - checkout-process
  parallel: false  # Sequential execution
  failFast: true   # Stop on first failure
```

#### Scheduled Regression Testing
```yaml
apiVersion: qa.company.com/v1
kind: QASchedule
metadata:
  name: nightly-regression
spec:
  schedule: "0 2 * * 1-5"  # Weeknights at 2 AM
  target:
    kind: QASuite
    name: full-regression-suite
```

## Configuration

### Operator Configuration

```yaml
# ConfigMap: qa-operator-config
apiVersion: v1
kind: Config
qa:
  defaultTimeout: 30s
  defaultRetries: 3
  concurrentJobs: 5
  cleanupInterval: 1h
  reportRetention: 7d
notifications:
  slack:
    enabled: true
    webhookUrl: "https://hooks.slack.com/services/YOUR/WEBHOOK"
    defaultChannel: "#qa-alerts"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WATCH_NAMESPACE` | Namespace to watch for CRs | All namespaces |
| `CONCURRENT_JOBS` | Max concurrent test jobs | 5 |
| `REPORT_RETENTION` | How long to keep reports | 7d |
| `SLACK_WEBHOOK_URL` | Slack notifications | - |

## Monitoring

### Metrics

The operator exposes Prometheus metrics at `/metrics`:

```prometheus
# Test execution metrics
qa_tests_total{status="pass"} 1456
qa_tests_total{status="fail"} 23
qa_test_duration_seconds{test="api-health"} 0.034

# Operator health
qa_operator_up 1
qa_operator_reconcile_duration_seconds 0.123
```

### Health Checks

```bash
# Operator health
kubectl get pods -n qa-system

# Test execution status
kubectl get qatests,qasuites,qaschedules,qareports -A

# View operator logs
kubectl logs -n qa-system deployment/qa-operator
```

## Troubleshooting

### Common Issues

#### CRDs Not Installed
```bash
kubectl apply -f operator/crds/
kubectl wait --for=condition=Established crd/qatests.qa.company.com
```

#### Operator Not Starting
```bash
kubectl describe pod -n qa-system -l app.kubernetes.io/name=qa-operator
kubectl logs -n qa-system -l app.kubernetes.io/name=qa-operator
```

#### Tests Not Executing
```bash
# Check operator permissions
kubectl auth can-i create jobs --as=system:serviceaccount:qa-system:qa-operator-sa

# Check test status
kubectl describe qatest <test-name>
```

#### Reports Not Generated
```bash
# Check operator logs for errors
kubectl logs -n qa-system deployment/qa-operator | grep error

# Verify RBAC permissions
kubectl get clusterrolebinding qa-operator-binding
```

### Debug Commands

```bash
# Watch all QA resources
kubectl get qatests,qasuites,qaschedules,qareports -A -w

# Check operator events
kubectl get events -n qa-system --sort-by=.metadata.creationTimestamp

# View detailed test results
kubectl get qareport <report-name> -o yaml
```

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/your-org/qa-operator
cd qa-operator

# Build operator
make build

# Run tests
make test

# Generate manifests
make manifests
```

### Testing Locally

```bash
# Run operator locally
make run

# In another terminal, apply test resources
kubectl apply -f config/samples/
```

## Security Considerations

### RBAC
- Operator uses minimal required permissions
- ServiceAccount with namespace-scoped access
- ClusterRole for cross-namespace monitoring

### Network Security
- Tests run in isolated Jobs
- Network policies restrict communication
- No privileged container access

### Secret Management
- External secrets for API keys
- No sensitive data in CRDs
- Encrypted communication via mTLS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

### Code Standards
- Go code follows standard conventions
- CRDs use OpenAPI v3 validation
- Comprehensive test coverage required

## License

This operator is licensed under the Apache License 2.0.

## Support

- **Documentation**: https://docs.qa-platform.com
- **Issues**: https://github.com/your-org/qa-operator/issues
- **Discussions**: https://github.com/your-org/qa-operator/discussions

---

**🎯 QA as Code - Your QA workflows are now Kubernetes-native!**

The QA Operator transforms testing from manual scripts to declarative, automated, and observable Kubernetes resources. Your QA infrastructure is now part of your cluster's control plane.