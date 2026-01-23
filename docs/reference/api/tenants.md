# GET /api/tenants

> **Reference**: Tenant discovery and lookup API.

## Request

```http
GET /api/tenants?action=lookup&slug=acme-corp
```

No authentication required for lookup. List requires authentication.

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | `lookup`, `domain`, or `list` |
| `slug` | string | For lookup | Tenant slug to look up |
| `domain` | string | For domain | Custom domain to resolve |

## Actions

### `lookup` - Find tenant by slug

```http
GET /api/tenants?action=lookup&slug=acme-corp
```

**Response (200)**:
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "slug": "acme-corp",
    "name": "Acme Corporation",
    "type": "organization",
    "status": "active"
  }
}
```

### `domain` - Resolve custom domain

```http
GET /api/tenants?action=domain&domain=acme.example.com
```

**Response (200)**:
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "slug": "acme-corp",
    "name": "Acme Corporation"
  }
}
```

### `list` - List user's tenants (authenticated)

```http
GET /api/tenants?action=list
```

Requires session cookie.

**Response (200)**:
```json
{
  "success": true,
  "tenants": [
    {
      "id": "uuid",
      "slug": "acme-corp",
      "name": "Acme Corporation",
      "type": "organization",
      "role": "owner"
    }
  ]
}
```

## Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid action | Missing or unknown action parameter |
| 401 | Unauthorized | List action without session |
| 404 | Tenant not found | Slug or domain doesn't exist |

## Example

```bash
# Lookup tenant
curl "https://nexuscanon-axis.vercel.app/api/tenants?action=lookup&slug=acme-corp"

# List user's tenants (with session)
curl -b "session=..." "https://nexuscanon-axis.vercel.app/api/tenants?action=list"
```
