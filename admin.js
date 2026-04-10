// 渲染表格
function renderTable(filterText = '', statusFilter = 'all') {
    const container = document.getElementById('obstacleTable');
    let filtered = obstacles.filter(obs => {
        const matchText = !filterText || obs.type.includes(filterText) || (obs.description && obs.description.includes(filterText));
        const matchStatus = statusFilter === 'all' || obs.status === statusFilter;
        return matchText && matchStatus;
    });
    
    let html = '<table><tr><th>ID</th><th>位置</th><th>类型</th><th>描述</th><th>状态</th><th>时间</th><th>照片</th><th>操作</th></tr>';
    filtered.forEach(obs => {
        html += `<tr>
            <td>${obs.id}</td>
            <td>${obs.lat.toFixed(4)}, ${obs.lng.toFixed(4)}</td>
            <td>${obs.type}</td>
            <td>${obs.description || '-'}</td>
            <td><span class="status-badge status-${obs.status}">${obs.status}</span></td>
            <td>${obs.reportTime}</td>
            <td>${obs.photo ? `<img src="${obs.photo}" class="photo-thumb" onclick="showPhoto('${obs.photo}')">` : '无'}</td>
            <td>
                <button onclick="changeStatus(${obs.id}, '已处理')">✅已处理</button>
                <button onclick="changeStatus(${obs.id}, '处理中')">⏳处理中</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    container.innerHTML = html;
    updateStats();
}

function changeStatus(id, newStatus) {
    const obs = obstacles.find(o => o.id == id);
    if (obs) {
        obs.status = newStatus;
        saveObstacles();
        renderTable(document.getElementById('searchInput').value, document.getElementById('statusFilter').value);
    }
}

function updateStats() {
    const total = obstacles.length;
    const resolved = obstacles.filter(o => o.status === '已处理').length;
    const pending = obstacles.filter(o => o.status === '未处理').length;
    const processing = obstacles.filter(o => o.status === '处理中').length;
    document.getElementById('totalCount').innerText = total;
    document.getElementById('pendingCount').innerText = pending;
    document.getElementById('resolvedCount').innerText = resolved;
    document.getElementById('processingCount').innerText = processing;
}

function renderCharts() {
    // 类型分布饼图
    const typeCounts = {};
    obstacles.forEach(o => { typeCounts[o.type] = (typeCounts[o.type] || 0) + 1; });
    const typeChart = echarts.init(document.getElementById('typeChart'));
    typeChart.setOption({
        title: { text: '障碍物类型分布' },
        tooltip: {},
        series: [{
            type: 'pie',
            data: Object.entries(typeCounts).map(([name, value]) => ({ name, value }))
        }]
    });
    
    // 趋势图
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(5,10);
        days.push(dateStr);
        counts.push(obstacles.filter(o => o.reportTime === d.toISOString().slice(0,10)).length);
    }
    const trendChart = echarts.init(document.getElementById('trendChartAdmin'));
    trendChart.setOption({
        title: { text: '近一周上报趋势' },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: counts }]
    });
}

function showPhoto(src) {
    document.getElementById('modalPhoto').src = src;
    document.getElementById('photoModal').style.display = 'flex';
}

function exportReport() {
    const reportContent = `
        无障碍出行周报
        总上报: ${obstacles.length}  已处理: ${obstacles.filter(o=>o.status==='已处理').length}
        主要障碍类型: ${[...new Set(obstacles.map(o=>o.type))].join(', ')}
    `;
    alert("模拟导出报告:\n" + reportContent);
    // 实际可用 html2canvas + jspdf 生成PDF
}

window.onload = () => {
    renderTable();
    renderCharts();
    
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadObstacles();
        renderTable(document.getElementById('searchInput').value, document.getElementById('statusFilter').value);
        renderCharts();
    });
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderTable(e.target.value, document.getElementById('statusFilter').value);
    });
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        renderTable(document.getElementById('searchInput').value, e.target.value);
    });
    
    document.getElementById('exportReportBtn').addEventListener('click', exportReport);
    document.getElementById('closePhotoModal').addEventListener('click', () => {
        document.getElementById('photoModal').style.display = 'none';
    });
};