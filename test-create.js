const base = "http://localhost:3000";
const tenantA = "65881898-4890-46ea-8280-e992782c990a";
const tenantB = "c04940bb-6147-4e9d-9d29-e163bba2d840";
const userA = "cc187cb5-60b2-47aa-8fa6-7213cde32d71";

const headers = {
  "Content-Type": "application/json",
  "X-Tenant-ID": tenantA,
  "Authorization": "Bearer dev",
  "X-Actor-ID": userA,
};

const created = await fetch(`${base}/api/requests`, {
  method: "POST",
  headers,
  body: JSON.stringify({})
}).then(r => r.json());

console.log(JSON.stringify(created, null, 2));
