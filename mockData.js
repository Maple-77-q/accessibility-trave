// 模拟POI数据（无障碍设施）
const poiList = [
    { id: 1, name: "市民中心图书馆", lat: 31.2304, lng: 121.4737, score: 4.8, hasElevator: true, hasRamp: true, type: "图书馆" },
    { id: 2, name: "中山公园地铁站A口", lat: 31.2223, lng: 121.4642, score: 2.5, hasElevator: false, hasRamp: false, type: "地铁站" },
    { id: 3, name: "第一人民医院", lat: 31.2401, lng: 121.4805, score: 4.2, hasElevator: true, hasRamp: true, type: "医院" },
    { id: 4, name: "万达广场", lat: 31.2350, lng: 121.4500, score: 3.9, hasElevator: true, hasRamp: false, type: "商场" }
];

// 模拟障碍物（初始）
let obstacles = [
    { id: 101, lat: 31.2280, lng: 121.4700, type: "台阶", status: "未处理", reportTime: "2025-04-08" },
    { id: 102, lat: 31.2330, lng: 121.4600, type: "坡道损坏", status: "处理中", reportTime: "2025-04-09" }
];

// 电梯/坡道实时状态（用于动态演示）
let facilityStatus = {
    "市民中心图书馆": { elevator: "正常", ramp: "正常" },
    "中山公园地铁站A口": { elevator: "维修中", ramp: "无" },
    "第一人民医院": { elevator: "正常", ramp: "正常" },
    "万达广场": { elevator: "正常", ramp: "维修中" }
};

// 辅助函数：保存障碍物到localStorage
function saveObstacles() {
    localStorage.setItem('obstacles', JSON.stringify(obstacles));
}
function loadObstacles() {
    const stored = localStorage.getItem('obstacles');
    if (stored) obstacles = JSON.parse(stored);
}
loadObstacles();