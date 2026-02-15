# Deployment Guide - Melius Operarius

This guide covers deploying Melius Operarius in various environments, from local development to production clusters.

## Table of Contents
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Local Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Ollama installed and running

### Setup
```bash
# Clone the repository
git clone https://github.com/appointeasedev-oss/melius-operarius.git
cd melius-operarius

# Install dependencies
npm install

# Run setup wizard
npx melius-operarius setup-wizard

# Start in development mode
npm run dev
```

## Docker Deployment

### Building the Image
```bash
# Build production image
npm run build:docker

# Or build directly with Docker
docker build -f Dockerfile.prod -t melius-operarius:latest .
```

### Running with Docker
```bash
# Run the container
docker run -p 3000:3000 melius-operarius:latest

# Run with persistent storage
docker run -p 3000:3000 -v melius-data:/app/data melius-operarius:latest

# Run with custom configuration
docker run -p 3000:3000 -v ./config:/app/config melius-operarius:latest
```

### Running with Docker Compose
```bash
# Use the provided docker-compose file
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

## Production Deployment

### Using PM2 (Recommended for Single Server)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs melius-operarius

# Monitor resource usage
pm2 monit

# Setup auto-start on boot
pm2 startup
pm2 save
```

### Using systemd (Linux)
```bash
# Copy service file to systemd directory (requires sudo)
sudo cp melius-operarius.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start on boot
sudo systemctl enable melius-operarius

# Start the service
sudo systemctl start melius-operarius

# Check status
sudo systemctl status melius-operarius
```

### Environment Variables
Configure your deployment with these environment variables:

```bash
# Server configuration
PORT=3000
NODE_ENV=production

# Ollama configuration
OLLAMA_HOST=http://localhost:11434

# Security
ALLOWED_ORIGINS=https://yourdomain.com
API_KEY_REQUIRED=false

# Database (if enabled)
DATABASE_URL=postgresql://user:password@localhost/dbname

# Logging
LOG_LEVEL=info
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (v1.19+)
- kubectl configured
- Helm (optional)

### Deploy with kubectl
```bash
# Apply the deployment configuration
kubectl apply -f deploy/k8s-deployment.yaml

# Check deployment status
kubectl get deployments
kubectl get pods

# View service
kubectl get services

# View logs
kubectl logs -l app=melius-operarius
```

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: melius-operarius-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: melius-operarius
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Ingress Configuration
Update the ingress configuration with your domain:

```bash
# Replace the hostname in k8s-deployment.yaml
sed -i 's/melius-operarius.example.com/your-domain.com/g' deploy/k8s-deployment.yaml

# Apply the updated configuration
kubectl apply -f deploy/k8s-deployment.yaml
```

## Cloud Deployment

### AWS Deployment
```bash
# Using AWS ECS
aws ecs create-cluster --cluster-name melius-operarius
# Follow AWS ECS documentation for detailed deployment

# Using AWS EC2
# Launch EC2 instance with Docker support
# Follow Docker deployment instructions
```

### Google Cloud Platform
```bash
# Using Google Cloud Run
gcloud run deploy melius-operarius \
  --image gcr.io/PROJECT-ID/melius-operarius \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated

# Using Google Kubernetes Engine (GKE)
# Follow Kubernetes deployment instructions
```

### Azure Deployment
```bash
# Using Azure Container Instances
az container create \
  --resource-group myResourceGroup \
  --name melius-operarius \
  --image meliusoperarius.azurecr.io/melius-operarius:latest \
  --dns-name-label melius-operarius \
  --ports 3000

# Using Azure Kubernetes Service (AKS)
# Follow Kubernetes deployment instructions
```

## Monitoring and Maintenance

### Health Checks
The application provides a health check endpoint:
- `/health` - Returns health status of the application

### Logging
Logs are written to:
- Console (stdout/stderr) - Development
- `./logs/app.log` - Production (configured in config files)

### Metrics
Monitor these key metrics:
- CPU and memory usage
- Response times
- Error rates
- Active connections
- Ollama model performance

### Backup Strategy
Regular backups should include:
- Configuration files (`./config/`)
- Persistent data (`./data/`)
- Logs (`./logs/`) - for debugging
- Model data (managed by Ollama)

### Updates
To update to a new version:

**Docker:**
```bash
# Pull latest image
docker pull melius-operarius:latest

# Stop current container
docker stop <container-id>

# Start new container
docker run -d -p 3000:3000 melius-operarius:latest
```

**Kubernetes:**
```bash
# Update deployment with new image
kubectl set image deployment/melius-operarius melius-operarius=melius-operarius:new-version

# Or rollout a new version
kubectl rollout restart deployment/melius-operarius
```

### Troubleshooting

**Common Issues:**

1. **Ollama not accessible**
   - Check if Ollama service is running
   - Verify OLLAMA_HOST configuration
   - Check firewall settings

2. **High memory usage**
   - Adjust model size/parameters
   - Implement request caching
   - Scale horizontally

3. **Slow response times**
   - Check Ollama performance
   - Optimize model selection
   - Consider GPU acceleration

**Debug Commands:**
```bash
# Check application logs
npm run dev # For development logs
pm2 logs # For PM2 logs
kubectl logs <pod-name> # For Kubernetes logs

# Check system resources
top # Linux/Mac
Get-Process # Windows

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/system
```

## Security Best Practices

- Use HTTPS in production
- Implement API rate limiting
- Secure Ollama with authentication if exposed
- Regular security updates
- Network segmentation
- Proper RBAC for Kubernetes
- Secret management for sensitive data