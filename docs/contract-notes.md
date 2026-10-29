# Contract Notes

Date: 2026-10-29

## Notes
- OpenAPI JSON fetched/saved as a placeholder (backend not running locally). Update with actual backend spec when available.
- Response envelope: `{ "data": ... }`; lists include `meta: { page, pageSize, total }`
- Errors: `{ "error": { "code": "UPPER_SNAKE", "message": "...", "details": [] } }`
- Money values are strings
- Timestamps ISO 8601 UTC
- Tenant routes under `/api/v1/organizations/:organizationId/...` (non-member receives 404)