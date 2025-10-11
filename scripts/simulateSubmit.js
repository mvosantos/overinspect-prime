// Simulate the payload transformation performed in NewServiceOrder.onSubmitLocal
// This script constructs example form data (including an attachments array with a presigned-uploaded file)
// and applies the same normalization logic used before calling serviceOrderService.create/update.

function simulateSubmit({ isEditing = true, routeId = '0199c3d3-75d7-7301-87e7-d633d3f5d840', selectedServiceTypeId = 'abb07b90-6cb4-46fc-b5d3-f049b42f78f7' } = {}) {
  // Example form data as returned by getValues()
  const data = {
    id: routeId,
    user_id: 'ab199be9-3193-4ca0-ae6a-e05bf4885774',
    company_id: '01973bf3-f393-7669-a7a5-f94dedb1ba32',
    service_type_id: selectedServiceTypeId,
    client_id: '01977aae-890c-70f8-9b4d-e1429535f312',
    subsidiary_id: '0197272d-6eb0-709e-9def-3bee217b1f68',
    number: '25000000075',
    vessel_name: 'MSC LIRICA',
    order_identifier: '25000033',
    operation_starts_at: new Date('2025-10-08'),
    created_at: '2025-10-08T12:37:19.000000Z',
    updated_at: '2025-10-08T12:37:19.000000Z',
    // attachments array with the presigned file metadata we've added on upload
    attachments: [
      {
        id: 'presign-12345',
        filename: 'teste.pdf',
        name: 'teste.pdf',
        path: 'service_order'
      }
    ],
    // services example
    services: [
      { service_id: 's-1', unit_price: '100.00', quantity: '2', scope: 'scope' }
    ],
    // other arrays may be present
    payments: [],
    schedules: []
  };

  // Begin transformation (copy of NewServiceOrder.onSubmitLocal behavior)
  const payload = { ...data };
  if (selectedServiceTypeId) payload.service_type_id = selectedServiceTypeId;

  // serialize dates
  if (payload.operation_starts_at && payload.operation_starts_at instanceof Date) {
    payload.operation_starts_at = payload.operation_starts_at.toISOString();
  }

  // ensure num_containers is numeric or undefined (not used in this example)
  if (payload.num_containers !== undefined && payload.num_containers !== null) {
    const n = Number(payload.num_containers);
    payload.num_containers = Number.isFinite(n) ? n : undefined;
  }

  // Normalize services array if present
  const maybeServices = (payload && typeof payload === 'object' ? payload['services'] : undefined);
  if (Array.isArray(maybeServices)) {
    const normalized = maybeServices.map((s) => {
      const item = (s && typeof s === 'object') ? s : {};
      const unit = Number(String(item.unit_price ?? 0));
      const qty = Math.floor(Number(String(item.quantity ?? 0)) || 0);
      const total = unit * qty;
      return {
        service_id: item.service_id ?? null,
        unit_price: !Number.isNaN(unit) ? unit.toFixed(2) : '0.00',
        quantity: String(qty),
        total_price: !Number.isNaN(total) ? total.toFixed(2) : '0.00',
        scope: item.scope ?? '',
      };
    });
    payload.services = normalized;
  }

  // At this point the attachments array should be untouched (we added it earlier),
  // serviceOrderService.create/update will later ensure pl.attachments exists and
  // will process any entries that have fileObject for upload.

  return payload;
}

const final = simulateSubmit({ isEditing: true });
console.log(JSON.stringify(final, null, 2));
