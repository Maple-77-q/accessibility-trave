console.log('app.js 开始执行');
console.log('Leaflet 可用?', typeof L !== 'undefined');
console.log('poiList 可用?', typeof poiList !== 'undefined');
// 初始化地图（中心设为上海某区域）
var map = L.map('map').setView([31.2304, 121.4737], 14);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
}).addTo(map);

// 存储标记图层
let poiMarkers = [];
let obstacleMarkers = [];

// 添加POI标记
function addPoiMarkers() {
    poiList.forEach(poi => {
        const color = poi.score >= 4 ? 'green' : (poi.score >= 3 ? 'orange' : 'red');
        const marker = L.marker([poi.lat, poi.lng], {
            icon: L.divIcon({ className: 'custom-poi', html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border:2px solid white;"></div>`, iconSize: [12,12] })
        }).addTo(map);
        marker.bindPopup(`
            <b>${poi.name}</b><br>
            可达性评分: ${poi.score} / 5 ⭐<br>
            电梯: ${facilityStatus[poi.name]?.elevator || '未知'}<br>
            坡道: ${facilityStatus[poi.name]?.ramp || '未知'}<br>
            <button onclick="navigateTo(${poi.lat}, ${poi.lng}, '${poi.name}')">导航至此</button>
        `);
        poiMarkers.push(marker);
    });
}

// 添加障碍物标记
function updateObstacleMarkers() {
    obstacleMarkers.forEach(m => map.removeLayer(m));
    obstacleMarkers = [];
    obstacles.forEach(obs => {
        const marker = L.marker([obs.lat, obs.lng], {
            icon: L.divIcon({ className: 'obstacle', html: '⚠️', iconSize: [20,20] })
        }).addTo(map);
        marker.bindPopup(`<b>障碍物</b><br>类型: ${obs.type}<br>状态: ${obs.status}<br>上报时间: ${obs.reportTime}`);
        obstacleMarkers.push(marker);
    });
}

// 模拟路径规划（写死两条路线）
function navigateTo(lat, lng, name) {
    const start = "当前位置（模拟：市民中心图书馆附近）";
    const end = name;
    // 模拟避开障碍物的简单逻辑
    let hasObstacleOnRoute = obstacles.some(obs => Math.abs(obs.lat - lat) < 0.01 && Math.abs(obs.lng - lng) < 0.01);
    let msg = `规划路线: ${start} → ${end}。`;
    if (hasObstacleOnRoute) {
        msg += " 检测到前方障碍物，已为您重新规划绕行路线（模拟）。";
    } else {
        msg += " 路线无障碍，预计步行10分钟。";
    }
    document.getElementById('status').innerText = msg;
    // 语音播报
    speak(msg);
    // 触觉反馈（模拟转弯提示）
    if (navigator.vibrate) navigator.vibrate([200,100,200]);
}

// 语音播报
function speak(text) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// 语音识别导航
function voiceNavigation() {
    if (!window.webkitSpeechRecognition) {
        alert("当前浏览器不支持语音识别，请使用Chrome");
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        document.getElementById('status').innerText = `识别到: ${command}`;
        // 简单匹配POI名称
        const matched = poiList.find(poi => command.includes(poi.name));
        if (matched) {
            navigateTo(matched.lat, matched.lng, matched.name);
        } else {
            speak("未找到该地点，请重新说地点名称，例如：导航到市民中心图书馆");
        }
    };
    recognition.start();
}

// SOS一键求助
function sos() {
    // 模拟发送求助信息
    const sosMsg = "SOS求助！用户当前位置可能需要帮助（模拟坐标31.2304,121.4737）。已通知社区管理员。";
    speak(sosMsg);
    document.getElementById('status').innerHTML = `<span style="color:red;">🚨 ${sosMsg}</span>`;
    // 震动
    if (navigator.vibrate) navigator.vibrate([500,200,500]);
    // 可选：弹出遮罩
    alert(sosMsg);
}

// 上报障碍物表单（简单弹窗）
function reportObstacle() {
    const type = prompt("请输入障碍物类型（例如：台阶、坡道损坏、盲道被占）", "台阶");
    if (!type) return;
    const lat = prompt("请输入经度（可输入当前地图中心经度）", map.getCenter().lng);
    const lng = prompt("请输入纬度", map.getCenter().lat);
    const newObstacle = {
        id: Date.now(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type: type,
        status: "未处理",
        reportTime: new Date().toISOString().slice(0,10)
    };
    obstacles.push(newObstacle);
    saveObstacles();
    updateObstacleMarkers();
    speak("感谢上报，管理员会尽快处理");
}

// 页面加载完成
window.onload = () => {
    addPoiMarkers();
    updateObstacleMarkers();
    document.getElementById('voiceBtn').onclick = voiceNavigation;
    document.getElementById('sosBtn').onclick = sos;
    document.getElementById('reportBtn').onclick = reportObstacle;


    // 隐私模态框：同意并继续
const agreeBtn = document.getElementById('agreePrivacy');
if (agreeBtn) {
    agreeBtn.addEventListener('click', () => {
        document.getElementById('privacyModal').style.display = 'none';
    });
}

// 数据看板按钮
const statsBtn = document.getElementById('statsBtn');
if (statsBtn) {
    statsBtn.addEventListener('click', showStats);
}

// 清除数据按钮
const clearDataBtn = document.getElementById('clearDataBtn');
if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        if (confirm('清除所有本地数据？此操作不可恢复。')) {
            localStorage.clear();
            location.reload();
        }
    });
}

// 关闭数据看板模态框
const closeModal = document.getElementById('closeModal');
if (closeModal) {
    closeModal.addEventListener('click', () => {
        document.getElementById('chartModal').style.display = 'none';
    });
}
};

// 模拟实时状态变化（每30秒随机改变一个设施状态，演示用）
setInterval(() => {
    const keys = Object.keys(facilityStatus);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const oldStatus = facilityStatus[randomKey];
    const newElevator = Math.random() > 0.5 ? "正常" : "维修中";
    const newRamp = Math.random() > 0.5 ? "正常" : "维修中";
    facilityStatus[randomKey] = { elevator: newElevator, ramp: newRamp };
    // 刷新弹窗内容（简单重新绑定popup）
    poiMarkers.forEach((marker, idx) => {
        const poi = poiList[idx];
        marker.getPopup().setContent(`
            <b>${poi.name}</b><br>
            可达性评分: ${poi.score} / 5 ⭐<br>
            电梯: ${facilityStatus[poi.name]?.elevator || '未知'}<br>
            坡道: ${facilityStatus[poi.name]?.ramp || '未知'}<br>
            <button onclick="navigateTo(${poi.lat}, ${poi.lng}, '${poi.name}')">导航至此</button>
        `);
    });
    console.log(`[模拟实时] ${randomKey} 状态变更: 电梯=${newElevator}, 坡道=${newRamp}`);
}, 30000);


// 模拟路线演示（写死从图书馆到第一人民医院）
function demoRoute() {
    const steps = [
        "从图书馆出发，向南直行50米",
        "前方路口右转，请注意台阶（已避开）",
        "继续直行200米，到达第一人民医院"
    ];
    let index = 0;
    function speakNext() {
        if (index >= steps.length) {
            speak("到达目的地");
            return;
        }
        speak(steps[index]);
        if (navigator.vibrate) navigator.vibrate([100]); // 转弯震动
        index++;
        setTimeout(speakNext, 5000);
    }
    speakNext();
}

function showStats() {
    document.getElementById('chartModal').style.display = 'block';
    // 覆盖率饼图：无障碍POI占比（score>=3.5算无障碍友好）
    const accessibleCount = poiList.filter(p => p.score >= 3.5).length;
    const notAccessible = poiList.length - accessibleCount;
    const coverageChart = echarts.init(document.getElementById('coverageChart'));
    coverageChart.setOption({
        title: { text: '无障碍设施覆盖率' },
        tooltip: {},
        series: [{
            type: 'pie',
            data: [
                { name: '无障碍友好POI', value: accessibleCount },
                { name: '待改善POI', value: notAccessible }
            ]
        }]
    });
    // 趋势图：近一周上报数量（模拟数据）
    const days = ['04-05', '04-06', '04-07', '04-08', '04-09', '04-10', '04-11'];
    const reportCounts = [2, 5, 3, 7, 4, 6, 2]; // 可以基于实际obstacles统计，但为简化直接用固定值
    const trendChart = echarts.init(document.getElementById('trendChart'));
    trendChart.setOption({
        title: { text: '近一周众包上报趋势' },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: reportCounts }]
    });
}
document.getElementById('statsBtn')?.addEventListener('click', showStats);
document.getElementById('closeModal')?.addEventListener('click', () => {
    document.getElementById('chartModal').style.display = 'none';
});
// 添加到控制面板按钮
// 在HTML中增加 <button id="demoRouteBtn">🚶 演示路线</button>
// 并在window.onload中绑定: document.getElementById('demoRouteBtn').onclick = demoRoute;


document.getElementById('agreePrivacy')?.addEventListener('click', () => {
    document.getElementById('privacyModal').style.display = 'none';
});
document.getElementById('clearDataBtn')?.addEventListener('click', () => {
    if (confirm('清除所有本地数据？此操作不可恢复。')) {
        localStorage.clear();
        location.reload();
    }
});