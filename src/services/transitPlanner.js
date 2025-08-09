import { fetchAllBusRoutes } from './busRouteService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDistance } from 'geolib';
import { extractStationsFromRoutes } from './stationService';
import { geocodeStation } from './stationService';

const CACHE_KEY = 'cached_stations';

// ==== DEBUG ====
const DEBUG = true;
const LG = (...a) => DEBUG && console.log('[Planner]', ...a);

// Giữ nguyên DEFAULTS/normalize/minutesBetween như bạn có
const DEFAULTS = {
  walkSpeedKmh: 4.8,
  transferPenaltyMin: 5,
  kNearest: 5,
  searchRadiusKm: 2,
  maxRadiusKm: 6,
};
const normalize = (s) => s?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const minutesBetween = (meters, walkSpeedKmh) => {
  const mPerMin = (walkSpeedKmh * 1000) / 60;
  return meters / Math.max(1, mPerMin);
};

// ---- Load/prepare stations (geocoded) ----
async function loadGeocodedStations() {
  LG('📦 loadGeocodedStations() đọc cache');
  const cached = await AsyncStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    LG('📦 cache hit:', parsed.length);
    return parsed;
  }

  LG('🌐 cache miss → extract + geocode');
  const names = await extractStationsFromRoutes();
  LG('📝 số tên trạm:', names.length);

  const results = await Promise.all(names.map((n) => geocodeStation(n)));
  const stations = results.filter(Boolean);
  LG('📍 geocoded stations:', stations.length);

  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(stations));
  return stations;
}

// ---- Build transit graph from routes ----
function buildGraphFromRoutes(routes) {
  const adj = new Map();
  const addEdge = (fromName, toName, route, minutesPerHop) => {
    const u = normalize(fromName);
    const v = normalize(toName);
    if (!u || !v) return;
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push({
      to: v,
      routeCode: route.RouteCode,
      routeName: route.RouteName,
      minutes: minutesPerHop,
      fromName,
      toName,
    });
  };

  LG('🧱 buildGraphFromRoutes với routes:', routes.length);
  for (const route of routes) {
    const dirs = [route.PathToDestination, route.PathToStart].filter(Boolean);
    for (const path of dirs) {
      const stops = path.split(' - ').map((s) => s.trim()).filter(Boolean);
      if (stops.length < 2) continue;
      const hopMinutes = Math.max(1, Math.round((route.TripDuration || 60) / Math.max(1, stops.length - 1)));
      for (let i = 0; i < stops.length - 1; i++) addEdge(stops[i], stops[i + 1], route, hopMinutes);
    }
  }
  LG('🧱 số node trong graph:', [...adj.keys()].length);
  return adj;
}

// ---- Find k nearest stations to coords ----
function nearestStations(coords, stations, k = 5, radiusKm = 2, maxRadiusKm = 6) {
  LG('📍 nearestStations()', { coords, k, radiusKm, maxRadiusKm });
  let r = radiusKm;
  while (r <= maxRadiusKm) {
    const within = stations
      .map((s) => ({ ...s, distance: getDistance(coords, s.coords) }))
      .filter((s) => s.distance <= r * 1000)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
    if (within.length) {
      LG('📍 trong bán kính', r, 'km:', within.map(x => ({ name: x.name, m: x.distance })));
      return within;
    }
    r += 1;
  }
  const fallback = stations
    .map((s) => ({ ...s, distance: getDistance(coords, s.coords) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
  LG('📍 fallback nearest:', fallback.map(x => ({ name: x.name, m: x.distance })));
  return fallback;
}

// ---- Dijkstra with transfer penalty ----
function shortestPathWithTransfers(adj, originCandidates, destCandidates, opts) {
  LG('🔗 shortestPathWithTransfers()', {
    originCandidates: originCandidates.map(s => s.name),
    destCandidates: destCandidates.map(s => s.name),
    opts
  });

  const { walkSpeedKmh, transferPenaltyMin } = opts;

  const SRC = '__SRC__';
  const DST = '__DST__';

  const walkFromSrc = new Map();
  for (const s of originCandidates) {
    walkFromSrc.set(normalize(s.name), minutesBetween(s.distance, walkSpeedKmh));
  }
  const walkToDst = new Map();
  for (const s of destCandidates) {
    walkToDst.set(normalize(s.name), minutesBetween(s.distance, walkSpeedKmh));
  }

  const push = (arr, item) => {
    arr.push(item);
    arr.sort((a, b) => a.dist - b.dist);
  };
  const keyOf = (node, lastRoute) => `${node}||${lastRoute || ''}`;

  const dist = new Map();
  const prev = new Map();
  const pq = [];

  const seedKey = keyOf(SRC, null);
  dist.set(seedKey, 0);
  push(pq, { key: seedKey, node: SRC, lastRoute: null, dist: 0 });

  const isDest = (state) => state.node === DST;

  while (pq.length) {
    const cur = pq.shift();
    if (cur.dist !== dist.get(cur.key)) continue;
    if (isDest(cur)) break;

    if (cur.node === SRC) {
      for (const [stKey, walkMin] of walkFromSrc) {
        const nextKey = keyOf(stKey, null);
        const ndist = cur.dist + walkMin;
        if (ndist < (dist.get(nextKey) ?? Infinity)) {
          dist.set(nextKey, ndist);
          prev.set(nextKey, { stateKey: cur.key, edge: { kind: 'walk', fromNode: SRC, toNode: stKey, minutes: walkMin } });
          push(pq, { key: nextKey, node: stKey, lastRoute: null, dist: ndist });
        }
      }
      continue;
    }

    if (walkToDst.has(cur.node)) {
      const walkMin = walkToDst.get(cur.node);
      const nextKey = keyOf(DST, cur.lastRoute);
      const ndist = cur.dist + walkMin;
      if (ndist < (dist.get(nextKey) ?? Infinity)) {
        dist.set(nextKey, ndist);
        prev.set(nextKey, { stateKey: cur.key, edge: { kind: 'walk', fromNode: cur.node, toNode: DST, minutes: walkMin } });
        push(pq, { key: nextKey, node: DST, lastRoute: cur.lastRoute, dist: ndist });
      }
    }

    const edges = adj.get(cur.node) || [];
    for (const e of edges) {
      const transferCost = cur.lastRoute && cur.lastRoute !== e.routeCode ? transferPenaltyMin : 0;
      const nextKey = keyOf(e.to, e.routeCode);
      const ndist = cur.dist + e.minutes + transferCost;

      if (ndist < (dist.get(nextKey) ?? Infinity)) {
        dist.set(nextKey, ndist);
        prev.set(nextKey, {
          stateKey: cur.key,
          edge: {
            kind: 'bus',
            fromNode: cur.node,
            toNode: e.to,
            minutes: e.minutes + transferCost,
            routeCode: e.routeCode,
            routeName: e.routeName,
            rawRideMinutes: e.minutes,
            transferPenalty: transferCost,
            fromName: e.fromName,
            toName: e.toName,
          },
        });
        push(pq, { key: nextKey, node: e.to, lastRoute: e.routeCode, dist: ndist });
      }
    }
  }

  const endKey = Array.from(dist.keys()).find((k) => k.startsWith(`${DST}||`));
  if (!endKey) {
    LG('❌ không reconstruct được đường đi');
    return null;
  }

  const legs = [];
  let cursor = endKey;
  while (cursor !== seedKey) {
    const pr = prev.get(cursor);
    if (!pr) break;
    legs.push(pr.edge);
    cursor = pr.stateKey;
  }
  legs.reverse();

  const out = [];
  let currentBus = null;

  for (const edge of legs) {
    if (edge.kind === 'walk') {
      if (currentBus) { out.push(currentBus); currentBus = null; }
      out.push({ type: 'walk', from: edge.fromNode, to: edge.toNode, minutes: Math.round(edge.minutes) });
    } else {
      if (currentBus && currentBus.routeCode === edge.routeCode && currentBus.to === edge.fromNode) {
        currentBus.to = edge.toNode;
        currentBus.minutes += edge.rawRideMinutes + edge.transferPenalty;
        currentBus.stops += 1;
        currentBus.segments.push({ from: edge.fromName, to: edge.toName, minutes: edge.rawRideMinutes });
      } else {
        if (currentBus) out.push(currentBus);
        currentBus = {
          type: 'bus',
          routeCode: edge.routeCode,
          routeName: edge.routeName,
          from: edge.fromNode,
          to: edge.toNode,
          minutes: edge.rawRideMinutes + edge.transferPenalty,
          stops: 1,
          segments: [{ from: edge.fromName, to: edge.toName, minutes: edge.rawRideMinutes }],
        };
      }
    }
  }
  if (currentBus) out.push(currentBus);

  const totalMinutes = Math.round(dist.get(endKey));
  const transfers =
    out.filter((l) => l.type === 'bus').length > 0
      ? Math.max(0, out.filter((l) => l.type === 'bus').length - 1)
      : 0;

  LG('🧮 shortestPath result', { totalMinutes, transfers, legs: out });
  return { totalMinutes, transfers, legs: out };
}

// ---- Public: Plan by coordinates ----
export async function planTransitByCoords(originCoords, destCoords, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  LG('🚶🚍 planTransitByCoords()', { originCoords, destCoords, opts });

  const [routesRes, stations] = await Promise.all([fetchAllBusRoutes(), loadGeocodedStations()]);
  const routes = routesRes.data?.Data || [];
  LG('📦 dữ liệu:', { routes: routes.length, stations: stations.length });

  const originCands = nearestStations(originCoords, stations, opts.kNearest, opts.searchRadiusKm, opts.maxRadiusKm);
  const destCands = nearestStations(destCoords, stations, opts.kNearest, opts.searchRadiusKm, opts.maxRadiusKm);

  const adj = buildGraphFromRoutes(routes);
  const plan = shortestPathWithTransfers(adj, originCands, destCands, opts);

  if (!plan) { LG('❌ plan = null'); return null; }

  // Gắn thêm chi tiết "đi bộ"
  const enrichWalk = (leg, fromCoords, toCoords) => {
    const meters = getDistance(fromCoords, toCoords);
    return { ...leg, meters, minutes: Math.round(minutesBetween(meters, opts.walkSpeedKmh)) };
  };

  const firstWalkIdx = plan.legs.findIndex((l) => l.type === 'walk' && l.from === '__SRC__');
  const lastWalkIdx = plan.legs.slice().reverse().findIndex((l) => l.type === 'walk' && l.to === '__DST__');
  const realLastWalkIdx = lastWalkIdx >= 0 ? plan.legs.length - 1 - lastWalkIdx : -1;

  if (firstWalkIdx >= 0) {
    const stNameNorm = plan.legs[firstWalkIdx].to;
    const st = stations.find((s) => normalize(s.name) === stNameNorm);
    if (st) {
      plan.legs[firstWalkIdx] = enrichWalk(plan.legs[firstWalkIdx], originCoords, st.coords);
      plan.legs[firstWalkIdx].from = 'Bạn';
      plan.legs[firstWalkIdx].to = st.name;
    }
  }

  if (realLastWalkIdx >= 0) {
    const stNameNorm = plan.legs[realLastWalkIdx].from;
    const st = stations.find((s) => normalize(s.name) === stNameNorm);
    if (st) {
      plan.legs[realLastWalkIdx] = enrichWalk(plan.legs[realLastWalkIdx], st.coords, destCoords);
      plan.legs[realLastWalkIdx].from = st.name;
      plan.legs[realLastWalkIdx].to = 'Điểm đến';
    }
  }

  plan.legs = plan.legs.map((leg) => {
    if (leg.type !== 'bus') return leg;
    const pretty = (key) => {
      const st = stations.find((s) => normalize(s.name) === key);
      return st?.name || key;
    };
    return { ...leg, from: pretty(leg.from), to: pretty(leg.to), segments: leg.segments?.map((seg) => ({ ...seg })) };
  });

  LG('✅ planTransitByCoords() kết quả', { totalMinutes: plan.totalMinutes, transfers: plan.transfers, legs: plan.legs });
  return plan;
}
