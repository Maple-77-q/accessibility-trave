function renderTable() {
    const container = document.getElementById('obstacleTable');
    if (!container) return;
    let html = '<table border="1" cellpadding="5"><tr><th>ID</th><th>经度</th><th>纬度</th><th>类型</th><th>状态</th><th>上报时间</th><th>操作</th></tr>';
    obstacles.forEach(obs => {
        html += `<tr>
            <td>${obs.id}</td>
            <td>${obs.lng}</td>
            <td>${obs.lat}</td>
            <td>${obs.type}</td>
            <td>${obs.status}</td>
            <td>${obs.reportTime}</td>
            <td><button onclick="changeStatus(${obs.id}, '已处理')">标记已处理</button>
                <button onclick="changeStatus(${obs.id}, '处理中')">处理中</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    container.innerHTML = html;
}

function changeStatus(id, newStatus) {
    const obs = obstacles.find(o => o.id == id);
    if (obs) {
        obs.status = newStatus;
        saveObstacles();
        renderTable();
        updateStats(); // 下面定义
    }
}

function updateStats() {
    const total = obstacles.length;
    const resolved = obstacles.filter(o => o.status === '已处理').length;
    const pending = total - resolved;
    document.getElementById('stats').innerHTML = `📊 统计：总上报 ${total}，已处理 ${resolved}，待处理 ${pending}`;
}

window.onload = () => {
    renderTable();
    updateStats();
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        loadObstacles();
        renderTable();
        updateStats();
    });
};