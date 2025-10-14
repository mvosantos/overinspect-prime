type Props = {
  currentOrderId?: string | null;
  selectedServiceTypeId?: string | null;
};

export default function GoodsSection({ currentOrderId, selectedServiceTypeId }: Props) {
  return (
    <div className="p-4">
      <h2>Goods Section</h2>
      <div>service_order_id: {String(currentOrderId ?? '')}</div>
      <div>service_type_id: {String(selectedServiceTypeId ?? '')}</div>
    </div>
  );
}
