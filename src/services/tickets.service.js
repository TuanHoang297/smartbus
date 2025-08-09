// services/tickets.service.js
import api from "./api";

export async function getTicketTypesByRoute(routeId) {
  const res = await api.get(`/tickets/route/${encodeURIComponent(routeId)}/ticket-types`);
  // API có thể trả [] hoặc { Data: [] }
  const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.Data) ? res.data.Data : []);

  return arr.map((t, idx) => {
    const id = t.TicketTypeId ?? t.id ?? idx;
    const name = t.TicketName ?? t.name ?? "Loại vé";
    const price = (t.Price !== undefined && t.Price !== null) ? Number(t.Price) : null;

    return {
      raw: t,                  // dữ liệu gốc
      routeId,                 // gắn route hiện tại
      id: String(id),          // id chuẩn hoá thành string cho ổn định key
      title: name,
      price,
      description: price != null ? `Giá vé: ${price.toLocaleString("vi-VN")} VNĐ` : "",
    };
  });
}

export async function getTicketTypesForRoutes(routeIds = []) {
  const ids = Array.from(new Set(routeIds.filter(Boolean)));
  const results = await Promise.all(ids.map(rid => getTicketTypesByRoute(rid).catch(() => [])));
  const flat = results.flat();

  // Loại trùng theo (routeId, id)
  const seen = new Set();
  return flat.filter(opt => {
    const key = `${opt.routeId}-${opt.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function createPayment(payload) {
  const { data } = await api.post("/tickets/create-payment", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data; // kỳ vọng { paymentUrl } hoặc { html }
}
    