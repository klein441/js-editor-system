const mysql = require('mysql2/promise');

// 直接创建连接池
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '520',
  database: 'js_editor',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 条形图示例数据
const barChartExample = {
  title: '条形图示例',
  description: 'D3.js条形图 - 加载CSV和JSON数据进行可视化展示',
  category: '条形图',
  files: {
    'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D3.js 加载 CSV 和 JSON 数据</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <h2>月度销售额 (数据来自 CSV 文件)</h2>
    <svg id="csvChart" width="500" height="300"></svg>
    
    <h2>季度利润统计 (数据来自 JSON 文件)</h2>
    <svg id="jsonChart" width="500" height="300"></svg>
    
    <p>提示：打开浏览器开发者工具的 Console 面板可以看到加载的数据。</p>

    <script>
        // 通用图表初始化函数
        function initChart(svgId) {
            const svg = d3.select(\`#\${svgId}\`);
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const margin = {top: 20, right: 20, bottom: 30, left: 40};
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            // 创建图表分组
            const chartGroup = svg.append("g")
                .attr("transform", \`translate(\${margin.left}, \${margin.top})\`);

            // 定义比例尺和坐标轴
            const xScale = d3.scaleBand().range([0, chartWidth]).padding(0.1);
            const yScale = d3.scaleLinear().range([chartHeight, 0]);
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            // 添加坐标轴容器
            chartGroup.append("g")
                .attr("class", "x-axis")
                .attr("transform", \`translate(0, \${chartHeight})\`);

            chartGroup.append("g")
                .attr("class", "y-axis");

            return { svg, chartGroup, xScale, yScale, xAxis, yAxis, chartWidth, chartHeight };
        }

        // 更新图表函数
        function updateChart(chart, data, valueKey) {
            // 转换数值类型
            data.forEach(d => {
                d[valueKey] = +d[valueKey];
            });

            // 设置比例尺定义域
            chart.xScale.domain(data.map(d => d.name));
            chart.yScale.domain([0, d3.max(data, d => d[valueKey])]);

            // 更新坐标轴
            chart.chartGroup.select(".x-axis").call(chart.xAxis);
            chart.chartGroup.select(".y-axis").call(chart.yAxis);

            // 处理条形
            const bars = chart.chartGroup.selectAll(".bar").data(data, d => d.name);
            bars.exit().remove();
            const newBars = bars.enter().append("rect").attr("class", "bar");
            newBars.merge(bars)
                .attr("x", d => chart.xScale(d.name))
                .attr("y", d => chart.yScale(d[valueKey]))
                .attr("width", chart.xScale.bandwidth())
                .attr("height", d => chart.chartHeight - chart.yScale(d[valueKey]));

            // 处理标签
            const labels = chart.chartGroup.selectAll(".label").data(data, d => d.name);
            labels.exit().remove();
            const newLabels = labels.enter().append("text").attr("class", "label");
            newLabels.merge(labels)
                .attr("x", d => chart.xScale(d.name) + chart.xScale.bandwidth() / 2)
                .attr("y", d => chart.yScale(d[valueKey]) - 5)
                .text(d => d[valueKey]);
        }

        // 初始化两个图表
        const csvChart = initChart("csvChart");
        const jsonChart = initChart("jsonChart");

        // 加载 CSV 数据
        d3.csv("sales-data.csv")
            .then(function(data) {
                console.log("从 CSV 加载的原始数据:", data);
                // 将 month 字段重命名为 name 以匹配图表函数
                data.forEach(d => {
                    d.name = d.month;
                });
                updateChart(csvChart, data, "sales");
            })
            .catch(function(error) {
                console.error("加载 CSV 文件时出错:", error);
                alert("加载CSV数据失败，请检查文件路径或网络连接。");
            });

        // 加载 JSON 数据
        d3.json("profit-data.json")
            .then(function(data) {
                console.log("从 JSON 加载的原始数据:", data);
                updateChart(jsonChart, data, "profit");
            })
            .catch(function(error) {
                console.error("加载 JSON 文件时出错:", error);
                alert("加载JSON数据失败，请检查文件路径或网络连接。");
            });

    </script>

</body>
</html>`,
    'styles.css': `/* 基础样式重置与全局设置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Arial, sans-serif;
}

/* 页面容器样式 */
body {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
    color: #333;
    line-height: 1.6;
}

/* 标题样式 */
h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 600;
}

/* SVG 图表容器样式 */
svg {
    width: 100%;
    max-width: 500px;
    height: 300px;
    margin: 0 auto;
    display: block;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 条形图样式 */
.bar {
    fill: steelblue;
    transition: all 0.3s ease;
    rx: 2;
    ry: 2;
}

.bar:hover {
    fill: orange;
    transform: translateY(-2px);
}

/* 数据标签样式 */
.label {
    font-size: 12px;
    text-anchor: middle;
    fill: #333;
    font-weight: 500;
}

/* 坐标轴样式优化 */
.x-axis text, .y-axis text {
    font-size: 11px;
    fill: #666;
}

.x-axis path, .y-axis path {
    stroke: #ddd;
}

.x-axis line, .y-axis line {
    stroke: #eee;
}

/* 提示文本样式 */
p {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    font-size: 0.9rem;
}`,
    'sales-data.csv': `month,sales
一月,120
二月,190
三月,80
四月,250`,
    'profit-data.json': `[
    {"name": "Q1", "profit": 12000},
    {"name": "Q2", "profit": 19000},
    {"name": "Q3", "profit": 15000},
    {"name": "Q4", "profit": 22000}
]`
  }
};

// 折线图示例数据
const lineChartExample = {
  title: '折线图示例',
  description: 'D3.js折线图 - 展示温度趋势和股票价格走势',
  category: '折线图',
  files: {
    'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D3.js 折线图 - 温度趋势</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <h2>月度平均温度趋势 (数据来自 CSV 文件)</h2>
    <svg id="tempChart" width="600" height="400"></svg>
    
    <h2>股票价格走势 (数据来自 JSON 文件)</h2>
    <svg id="stockChart" width="600" height="400"></svg>
    
    <p>提示：鼠标悬停在数据点上可以查看详细信息。</p>

    <script>
        // 通用折线图初始化函数
        function initLineChart(svgId) {
            const svg = d3.select(\`#\${svgId}\`);
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            const margin = {top: 20, right: 30, bottom: 40, left: 50};
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            // 创建图表分组
            const chartGroup = svg.append("g")
                .attr("transform", \`translate(\${margin.left}, \${margin.top})\`);

            // 定义比例尺
            const xScale = d3.scalePoint().range([0, chartWidth]).padding(0.5);
            const yScale = d3.scaleLinear().range([chartHeight, 0]);
            
            // 定义坐标轴
            const xAxis = d3.axisBottom(xScale);
            const yAxis = d3.axisLeft(yScale);

            // 添加坐标轴容器
            chartGroup.append("g")
                .attr("class", "x-axis")
                .attr("transform", \`translate(0, \${chartHeight})\`);

            chartGroup.append("g")
                .attr("class", "y-axis");

            // 定义折线生成器
            const line = d3.line()
                .x(d => xScale(d.name))
                .y(d => yScale(d.value))
                .curve(d3.curveMonotoneX);

            // 添加折线路径
            chartGroup.append("path")
                .attr("class", "line");

            // 添加数据点容器
            chartGroup.append("g")
                .attr("class", "dots");

            return { svg, chartGroup, xScale, yScale, xAxis, yAxis, line, chartWidth, chartHeight };
        }

        // 更新折线图函数
        function updateLineChart(chart, data, valueKey) {
            // 转换数值类型
            data.forEach(d => {
                d.value = +d[valueKey];
            });

            // 设置比例尺定义域
            chart.xScale.domain(data.map(d => d.name));
            chart.yScale.domain([
                d3.min(data, d => d.value) * 0.9,
                d3.max(data, d => d.value) * 1.1
            ]);

            // 更新坐标轴
            chart.chartGroup.select(".x-axis").call(chart.xAxis);
            chart.chartGroup.select(".y-axis").call(chart.yAxis);

            // 更新折线
            chart.chartGroup.select(".line")
                .datum(data)
                .attr("d", chart.line)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2);

            // 更新数据点
            const dots = chart.chartGroup.select(".dots")
                .selectAll(".dot")
                .data(data);

            dots.exit().remove();

            const newDots = dots.enter()
                .append("circle")
                .attr("class", "dot");

            newDots.merge(dots)
                .attr("cx", d => chart.xScale(d.name))
                .attr("cy", d => chart.yScale(d.value))
                .attr("r", 5)
                .attr("fill", "steelblue")
                .on("mouseover", function(event, d) {
                    d3.select(this)
                        .attr("r", 7)
                        .attr("fill", "orange");
                    
                    // 显示提示信息
                    chart.chartGroup.append("text")
                        .attr("class", "tooltip")
                        .attr("x", chart.xScale(d.name))
                        .attr("y", chart.yScale(d.value) - 15)
                        .attr("text-anchor", "middle")
                        .text(\`\${d.name}: \${d.value}\`);
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("r", 5)
                        .attr("fill", "steelblue");
                    
                    chart.chartGroup.selectAll(".tooltip").remove();
                });
        }

        // 初始化两个图表
        const tempChart = initLineChart("tempChart");
        const stockChart = initLineChart("stockChart");

        // 加载温度数据 (CSV)
        d3.csv("temperature-data.csv")
            .then(function(data) {
                console.log("从 CSV 加载的温度数据:", data);
                updateLineChart(tempChart, data, "temperature");
            })
            .catch(function(error) {
                console.error("加载 CSV 文件时出错:", error);
                alert("加载CSV数据失败，请检查文件路径。");
            });

        // 加载股票数据 (JSON)
        d3.json("stock-data.json")
            .then(function(data) {
                console.log("从 JSON 加载的股票数据:", data);
                updateLineChart(stockChart, data, "price");
            })
            .catch(function(error) {
                console.error("加载 JSON 文件时出错:", error);
                alert("加载JSON数据失败，请检查文件路径。");
            });

    </script>

</body>
</html>`,
    'styles.css': `/* 基础样式重置与全局设置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Arial, sans-serif;
}

/* 页面容器样式 */
body {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1rem;
    color: #333;
    line-height: 1.6;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

/* 标题样式 */
h2 {
    color: #2c3e50;
    margin: 2rem 0 1.5rem;
    text-align: center;
    font-weight: 600;
}

/* SVG 图表容器样式 */
svg {
    width: 100%;
    max-width: 600px;
    height: 400px;
    margin: 0 auto;
    display: block;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* 折线样式 */
.line {
    fill: none;
    stroke: steelblue;
    stroke-width: 2;
}

/* 数据点样式 */
.dot {
    fill: steelblue;
    stroke: white;
    stroke-width: 2;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot:hover {
    fill: orange;
    r: 7;
}

/* 提示文本样式 */
.tooltip {
    font-size: 14px;
    font-weight: bold;
    fill: #333;
    pointer-events: none;
}

/* 坐标轴样式优化 */
.x-axis text, .y-axis text {
    font-size: 12px;
    fill: #666;
}

.x-axis path, .y-axis path {
    stroke: #999;
}

.x-axis line, .y-axis line {
    stroke: #ddd;
}

/* 页面提示文本样式 */
p {
    text-align: center;
    margin-top: 2rem;
    color: #666;
    font-size: 0.9rem;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`,
    'temperature-data.csv': `name,temperature
一月,5
二月,7
三月,12
四月,18
五月,23
六月,28
七月,32
八月,31
九月,26
十月,20
十一月,13
十二月,7`,
    'stock-data.json': `[
    {"name": "周一", "price": 150},
    {"name": "周二", "price": 155},
    {"name": "周三", "price": 148},
    {"name": "周四", "price": 162},
    {"name": "周五", "price": 158},
    {"name": "周六", "price": 165},
    {"name": "周日", "price": 170}
]`
  }
};

async function initExamples() {
  try {
    console.log('🔧 开始初始化可视化示例...');

    // 检查是否已存在示例
    const [existing] = await pool.query(
      'SELECT COUNT(*) as count FROM visualization_examples'
    );

    if (existing[0].count > 0) {
      console.log('⚠️  数据库中已有示例数据，跳过初始化');
      console.log(`   当前示例数量: ${existing[0].count}`);
      process.exit(0);
    }

    // 插入条形图示例
    console.log('📊 插入条形图示例...');
    await pool.query(`
      INSERT INTO visualization_examples (title, description, category, files, created_by)
      VALUES (?, ?, ?, ?, NULL)
    `, [
      barChartExample.title,
      barChartExample.description,
      barChartExample.category,
      JSON.stringify(barChartExample.files)
    ]);
    console.log('✅ 条形图示例插入成功');

    // 插入折线图示例
    console.log('📈 插入折线图示例...');
    await pool.query(`
      INSERT INTO visualization_examples (title, description, category, files, created_by)
      VALUES (?, ?, ?, ?, NULL)
    `, [
      lineChartExample.title,
      lineChartExample.description,
      lineChartExample.category,
      JSON.stringify(lineChartExample.files)
    ]);
    console.log('✅ 折线图示例插入成功');

    // 验证插入
    const [result] = await pool.query(
      'SELECT id, title, category FROM visualization_examples'
    );

    console.log('\n✅ 初始化完成！');
    console.log('📊 已插入的示例:');
    result.forEach(item => {
      console.log(`   - ${item.title} (${item.category}) [ID: ${item.id}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

initExamples();
