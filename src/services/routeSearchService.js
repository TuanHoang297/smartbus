import { fetchAllBusRoutes } from './busRouteService';

// ✅ Hàm normalize bỏ dấu, trim, lowercase
function normalize(str) {
  return str
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

// ✅ Hàm lấy giờ chuyến tiếp theo
function getNextTripTime(startTimeStr, endTimeStr, intervalMinutes = 15) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const startTime = new Date(`${today}T${startTimeStr}`);
  const endTime = new Date(`${today}T${endTimeStr}`);

  if (now < startTime) {
    return { time: startTime.toTimeString().slice(0, 5), isTomorrow: false };
  }

  if (now > endTime) {
    return { time: startTime.toTimeString().slice(0, 5), isTomorrow: true }; // chuyến tiếp theo ngày mai
  }

  const minutesSinceStart = Math.floor((now - startTime) / 60000);
  const nextTripInMin = Math.ceil(minutesSinceStart / intervalMinutes) * intervalMinutes;
  const nextTripTime = new Date(startTime.getTime() + nextTripInMin * 60000);

  return { time: nextTripTime.toTimeString().slice(0, 5), isTomorrow: false };
}

// ✅ Hàm chính tìm tuyến phù hợp
export const findBusRoutesFromTo = async (from, to) => {
  try {
    console.log(`🔍 Tìm tuyến từ "${from}" đến "${to}"`);

    const res = await fetchAllBusRoutes();
    const routes = res.data?.Data || [];

    const normalizedFrom = normalize(from);
    const normalizedTo = normalize(to);

    const matched = [];

    for (const route of routes) {
      const directions = [
        { path: route.PathToDestination, label: "Destination" },
        { path: route.PathToStart, label: "Start" },
      ];

      for (const dir of directions) {
        const pathArr = dir.path?.split(" - ") || [];
        const lowerPath = pathArr.map(p => normalize(p));
        const fromIndex = lowerPath.indexOf(normalizedFrom);
        const toIndex = lowerPath.indexOf(normalizedTo);

        if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
          console.log(`✅ Khớp tuyến ${route.RouteCode} (${route.RouteName}) chiều ${dir.label}`);
          console.log(`   📍 From: ${pathArr[fromIndex]} → To: ${pathArr[toIndex]} (${toIndex - fromIndex} chặng)`);

          const interval = 15; // tạm thời cố định
          const tripInfo = getNextTripTime(route.StartTime, route.EndTime, interval);

          const timeDisplay = tripInfo.isTomorrow ? `Ngày mai (${tripInfo.time})` : tripInfo.time;
          console.log(`   ⏰ Chuyến tiếp theo: ${timeDisplay}`);

          matched.push({
            time: timeDisplay,
            duration: `${route.TripDuration} phút`,
            station: pathArr[fromIndex],
            price: "5.000",
            routeCode: route.RouteCode,
            routeName: route.RouteName,
            numStops: toIndex - fromIndex,
          });
        }
      }
    }

    matched.sort((a, b) => a.numStops - b.numStops);
    console.log(`🎯 Tổng tuyến tìm được: ${matched.length}`);
    return matched;
  } catch (err) {
    console.error("❌ Failed to find routes:", err);
    return [];
  }
};
