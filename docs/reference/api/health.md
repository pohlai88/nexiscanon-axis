# GET /api/health

> **Reference**: Health check endpoint for monitoring.

## Request

```http
GET /api/health
```

No authentication required.

## Response

### Success (200)

```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "checks": {
    "database": "ok",
    "auth": "ok"
  }
}
```

### Degraded (200)

```json
{
  "status": "degraded",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "checks": {
    "database": "ok",
    "auth": "error"
  }
}
```

### Unhealthy (503)

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "checks": {
    "database": "error",
    "auth": "error"
  }
}
```

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `healthy`, `degraded`, or `unhealthy` |
| `timestamp` | string | ISO 8601 timestamp |
| `checks.database` | string | Database connection status |
| `checks.auth` | string | Neon Auth status |

## Use Cases

- Uptime monitoring (BetterStack, Checkly)
- Load balancer health checks
- Kubernetes liveness probes
- Deployment verification

## Example

```bash
curl https://nexuscanon-axis.vercel.app/api/health
```
