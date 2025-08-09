// services/routeSearchService.js
import { fetchAllBusRoutes } from './busRouteService';
import { geocodeStation } from './stationService';
import { planTransitByCoords } from './transitPlanner';

// ==== DEBUG (bật/tắt log ở đây) ====
const DEBUG = true;
const LG = (...a) => DEBUG && console.log('[RouteSearch]', ...a);
const WARN = (...a) => DEBUG && console.warn('[RouteSearch]', ...a);

// ---------------- Utils ----------------
function normalize(str) {
  return str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Tính giờ chuyến tiếp theo (ước lượng) dựa vào StartTime/EndTime và khoảng cách chuyến (intervalMinutes).
 * @returns {{time: string, isTomorrow: boolean}}
 */
function getNextTripTime(startTimeStr, endTimeStr, intervalMinutes = 15) {
  if (!startTimeStr || !endTimeStr) {
    const now = new Date();
    return { time: now.toTimeString().slice(0, 5), isTomorrow: false };
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const startTime = new Date(`${today}T${startTimeStr}`);
  const endTime = new Date(`${today}T${endTimeStr}`);

  if (now < startTime) return { time: startTime.toTimeString().slice(0, 5), isTomorrow: false };
  if (now > endTime) return { time: startTime.toTimeString().slice(0, 5), isTomorrow: true };

  const minutesSinceStart = Math.floor((now - startTime) / 60000);
  const nextTripInMin = Math.ceil(minutesSinceStart / intervalMinutes) * intervalMinutes;
  const nextTripTime = new Date(startTime.getTime() + nextTripInMin * 60000);
  return { time: nextTripTime.toTimeString().slice(0, 5), isTomorrow: false };
}

// ---------------- Main search ----------------
export const findBusRoutesFromTo = async (from, to, options = {}) => {
  const {
    intervalMinutes = 15,
    walkSpeedKmh = 4.8,
    transferPenaltyMin = 5,
    kNearest = 5,
    searchRadiusKm = 2,
    maxRadiusKm = 6,
  } = options;

  try {
    LG('🔎 findBusRoutesFromTo()', { from, to, options: { intervalMinutes, walkSpeedKmh, transferPenaltyMin, kNearest, searchRadiusKm, maxRadiusKm } });

    const res = await fetchAllBusRoutes();
    const routes = res?.data?.Data || [];
    LG('📦 số tuyến tải được:', routes.length);

    const normalizedFrom = normalize(from);
    const normalizedTo = normalize(to);
    LG('🔤 normalized', { from: normalizedFrom, to: normalizedTo });

    const directMatches = [];

    for (const route of routes) {
      const directions = [
        { path: route?.PathToDestination, label: 'Destination' },
        { path: route?.PathToStart, label: 'Start' },
      ];

      for (const dir of directions) {
        if (!dir.path) continue;

        const pathArr = dir.path.split(' - ').map(s => s.trim()).filter(Boolean);
        const lowerPath = pathArr.map(p => normalize(p));
        const fromIndex = lowerPath.indexOf(normalizedFrom);
        const toIndex = lowerPath.indexOf(normalizedTo);

        DEBUG && console.log(
          '[RouteSearch] 🔁 check',
          route.RouteCode, `(${dir.label})`,
          { stops: pathArr.length, fromIndex, toIndex }
        );

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          const tripInfo = getNextTripTime(route.StartTime, route.EndTime, intervalMinutes);
          const timeDisplay = tripInfo.isTomorrow ? `Ngày mai (${tripInfo.time})` : tripInfo.time;

          LG('✅ match trực tiếp', {
            route: `${route.RouteCode} - ${route.RouteName}`,
            from: pathArr[fromIndex],
            to: pathArr[toIndex],
            stops: toIndex - fromIndex
          });

          directMatches.push({
            type: 'direct',
            time: timeDisplay,
            duration: route.TripDuration ? `${route.TripDuration} phút` : undefined,
            price: '5.000',
            routeCode: route.RouteCode,
            routeName: route.RouteName,
            station: pathArr[fromIndex],
            toStation: pathArr[toIndex],
            numStops: toIndex - fromIndex,
            pathPreview: pathArr.slice(fromIndex, toIndex + 1),
            direction: dir.label,
          });
        }
      }
    }

    directMatches.sort((a, b) => a.numStops - b.numStops);

    if (directMatches.length) {
      LG('🎯 trả về directMatches:', directMatches.length);
      return directMatches;
    }

    // ---------- Planner fallback ----------
    LG('🔁 Không có tuyến trực tiếp → fallback planner');

    const [gFrom, gTo] = await Promise.all([geocodeStation(from), geocodeStation(to)]);
    LG('📍 geocode from/to:', gFrom, gTo);

    if (!gFrom || !gTo) {
      WARN('❌ Geocode thất bại from/to → []');
      return [];
    }

    const plan = await planTransitByCoords(
      gFrom.coords,
      gTo.coords,
      { walkSpeedKmh, transferPenaltyMin, kNearest, searchRadiusKm, maxRadiusKm }
    );

    if (!plan) {
      WARN('❌ planner trả về null → []');
      return [];
    }

    LG('🧭 planner result', { totalMinutes: plan.totalMinutes, transfers: plan.transfers, legs: plan.legs });

    const multiResult = {
      type: 'multi',
      title: 'Lộ trình gợi ý',
      duration: `${plan.totalMinutes} phút (ước lượng)`,
      totalMinutes: plan.totalMinutes,
      transfers: plan.transfers,
      totalBusStops: plan.legs.filter(l => l.type === 'bus').reduce((sum, l) => sum + (l.stops || 0), 0),
      legs: plan.legs,
      originLabel: gFrom?.name || from,
      destinationLabel: gTo?.name || to,
    };

    LG('✅ trả về kết quả planner 1 phần tử');
    return [multiResult];
  } catch (err) {
    console.error('[RouteSearch] ❌ Failed to find routes:', err?.message || err);
    return [];
  }
};

export default { findBusRoutesFromTo };
