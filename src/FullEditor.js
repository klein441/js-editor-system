import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, FolderPlus, FilePlus, RefreshCw, Save, Trash2, FileCode, Folder, 
  ChevronRight, ChevronDown, Upload, GripVertical, Download, Edit2,
  PackageOpen, PackagePlus, BarChart3, ArrowLeft, Send
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as d3 from 'd3';
import BackgroundTemplates, { THEMES } from './BackgroundTemplates';

const TEMPLATES = {
  'HTML基础': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的页面</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello World! 🎉</h1>
    <p>这是一个基础的HTML模板</p>
  </div>
  <script>
    console.log('页面加载完成');
  </script>
</body>
</html>`,
  'JavaScript文件': `// 示例函数
function greet(name) {
  return \`你好, \${name}!\`;
}

// 数组操作
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((a, b) => a + b, 0);

console.log(greet('世界'));
console.log('原始数组:', numbers);
console.log('翻倍后的数组:', doubled);
console.log('数组总和:', sum);

// 对象操作
const person = {
  name: '张三',
  age: 25,
  greet() {
    return \`我是\${this.name}，今年\${this.age}岁\`;
  }
};

console.log(person.greet());`,
  'CSS样式': `/* 基础样式 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}`,
  'TODO列表': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>待办事项</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    input[type="text"] {
      width: 70%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 5px;
    }
    button {
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-left: 10px;
    }
    li {
      padding: 10px;
      margin: 10px 0;
      background: #f9f9f9;
      border-left: 4px solid #4CAF50;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📝 待办事项</h1>
    <div>
      <input type="text" id="todoInput" placeholder="输入新任务...">
      <button onclick="addTodo()">添加</button>
    </div>
    <ul id="todoList"></ul>
  </div>
  <script>
    let todos = [];
    function addTodo() {
      const input = document.getElementById('todoInput');
      const text = input.value.trim();
      if (text) {
        todos.push(text);
        input.value = '';
        render();
      }
    }
    function render() {
      const list = document.getElementById('todoList');
      list.innerHTML = todos.map(t => '<li>' + t + '</li>').join('');
    }
  </script>
</body>
</html>`
};

// ==========================================
// 可视化示例项目集合
// ==========================================
const VISUALIZATION_EXAMPLES = {
  '条形图': {
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
    rx: 2; /* 轻微圆角 */
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
  },
  '折线图': {
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
    
    <p>{t('hoverForDetails')}</p>

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

// ==========================================
// 文件选择提交模态框组件
// ==========================================
const SubmitModal = ({ show, files, projectFiles, onClose, onSubmit }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableFiles = projectFiles.filter(f => f.type === 'file');

  const toggleFile = (filePath) => {
    setSelectedFiles(prev => ({
      ...prev,
      [filePath]: !prev[filePath]
    }));
  };

  const toggleAll = () => {
    const allSelected = availableFiles.every(f => selectedFiles[f.path]);
    const newSelection = {};
    availableFiles.forEach(f => {
      newSelection[f.path] = !allSelected;
    });
    setSelectedFiles(newSelection);
  };

  const handleSubmit = async () => {
    const selected = Object.entries(selectedFiles)
      .filter(([_, isSelected]) => isSelected)
      .map(([path]) => path);

    if (selected.length === 0) {
      alert('请至少选择一个文件');
      return;
    }

    setIsSubmitting(true);
    const submitFiles = {};
    selected.forEach(path => {
      submitFiles[path] = files[path] || '';
    });

    await onSubmit(submitFiles);
    setIsSubmitting(false);
    onClose();
  };

  if (!show) return null;

  const selectedCount = Object.values(selectedFiles).filter(Boolean).length;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#2d2d30', borderRadius: '16px',
        width: '90%', maxWidth: '500px', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        border: '1px solid #3e3e42'
      }}>
        {/* 头部 */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #3e3e42',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{t('submitAssignmentTitle')}</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>{t('selectFilesToSubmit')}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#888',
            fontSize: '24px', cursor: 'pointer', padding: '4px'
          }}>×</button>
        </div>

        {/* 文件列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          <div onClick={toggleAll} style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px',
            background: '#1e1e1e', borderRadius: '8px', marginBottom: '12px',
            cursor: 'pointer', border: '1px solid #3e3e42'
          }}>
            <input type="checkbox"
              checked={availableFiles.length > 0 && availableFiles.every(f => selectedFiles[f.path])}
              onChange={toggleAll}
              style={{ marginRight: '12px', transform: 'scale(1.2)' }}
            />
            <span style={{ color: '#fff', fontWeight: '500' }}>全选所有文件</span>
            <span style={{ marginLeft: 'auto', color: '#888', fontSize: '13px' }}>
              {availableFiles.length} 个文件
            </span>
          </div>

          {availableFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <p>{t('noFilesToSubmit')}</p>
              <p style={{ fontSize: '13px' }}>{t('createFilesFirst')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableFiles.map(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                const iconColor = { 'html': '#e34c26', 'css': '#264de4', 'js': '#f7df1e', 'json': '#000', 'md': '#083fa1' }[ext] || '#888';
                return (
                  <div key={file.path} onClick={() => toggleFile(file.path)} style={{
                    display: 'flex', alignItems: 'center', padding: '14px 16px',
                    background: selectedFiles[file.path] ? 'rgba(99,102,241,0.15)' : '#1e1e1e',
                    borderRadius: '8px', cursor: 'pointer',
                    border: selectedFiles[file.path] ? '1px solid #6366f1' : '1px solid #3e3e42',
                    transition: 'all 0.2s ease'
                  }}>
                    <input type="checkbox" checked={!!selectedFiles[file.path]}
                      onChange={() => toggleFile(file.path)}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '6px',
                      background: `${iconColor}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: iconColor }}>
                        {ext.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '14px' }}>{file.name}</div>
                      <div style={{ color: '#888', fontSize: '12px' }}>{file.path}</div>
                    </div>
                    {files[file.path] && (
                      <span style={{ color: '#888', fontSize: '12px' }}>
                        {(files[file.path].length / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #3e3e42',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ color: '#888', fontSize: '13px' }}>
            已选择 <span style={{ color: '#6366f1', fontWeight: 'bold' }}>{selectedCount}</span> 个文件
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{
              padding: '10px 20px', background: '#3e3e42', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}>取消</button>
            <button onClick={handleSubmit}
              disabled={selectedCount === 0 || isSubmitting}
              style={{
                padding: '10px 24px',
                background: selectedCount === 0 ? '#555' : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                color: '#fff', border: 'none', borderRadius: '8px',
                cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  提交中...
                </>
              ) : (
                <>
                  <Send size={16} />
                  确认提交
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ==========================================
// 主编辑器组件
// ==========================================
function FullEditor({ 
    initialFiles = {}, 
    projectName = '默认项目',
    onBack,
    onSave,
    onSubmit,
    mode = 'playground'
}) {
  const [projects, setProjects] = useState([
    { id: '1', name: '默认项目', files: [] }
  ]);
  const [currentProject, setCurrentProject] = useState('1');
  const [files, setFiles] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBgTemplates, setShowBgTemplates] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showVisualizationExamples, setShowVisualizationExamples] = useState(false);
  const [allVisualizationExamples, setAllVisualizationExamples] = useState(VISUALIZATION_EXAMPLES);
  const [themeName, setThemeName] = useState(() => {
    try {
      return localStorage.getItem('my-js-editor-theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  const [editorWidth, setEditorWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [d3Data, setD3Data] = useState(null);

  // 加载数据库中的可视化示例
  useEffect(() => {
    const loadDatabaseExamples = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/visualization-examples');
        if (response.ok) {
          const dbExamples = await response.json();
          // 合并内置示例和数据库示例
          const merged = { ...VISUALIZATION_EXAMPLES };
          dbExamples.forEach(example => {
            merged[example.title] = example.files;
          });
          setAllVisualizationExamples(merged);
        }
      } catch (error) {
        console.error('加载数据库示例失败:', error);
        // 失败时使用内置示例
        setAllVisualizationExamples(VISUALIZATION_EXAMPLES);
      }
    };
    loadDatabaseExamples();
  }, []);

  useEffect(() => {
    if (initialFiles && Object.keys(initialFiles).length > 0) {
      const fileList = Object.keys(initialFiles).map(path => ({
        id: path,
        name: path.split('/').pop(),
        path: path,
        type: 'file',
        parentPath: path.includes('/') ? path.split('/').slice(0, -1).join('/') : ''
      }));
      
      setProjects([{ id: '1', name: projectName, files: fileList }]);
      setFiles(initialFiles);
      
      if (fileList.length > 0) {
        setCurrentFile(fileList[0].path);
        setCode(initialFiles[fileList[0].path] || '');
      }
    }
  }, [initialFiles, projectName]);

  const fileInputRef = useRef(null);
  const projectInputRef = useRef(null);
  const csvInputRef = useRef(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const getCurrentProject = () => projects.find(p => p.id === currentProject);

  const addFileInternal = (name, parentPath = '', content = '') => {
    const filePath = parentPath ? `${parentPath}/${name}` : name;
    const newFile = {
      id: Date.now().toString() + Math.random(),
      name,
      path: filePath,
      type: 'file',
      parentPath
    };

    setProjects(prev => prev.map(p =>
      p.id === currentProject
        ? { ...p, files: [...p.files, newFile] }
        : p
    ));
    setFiles(prev => ({ ...prev, [filePath]: content }));
    return filePath;
  };

  const loadBgTemplate = async (key) => {
    const map = {
      old: 'Old.html',
      simple: 'simple.html',
      sweet: 'sweet.html',
      tech: 'Tech.html'
    };
    const fileName = map[key] || map.old;
    const url = `/BG/${fileName}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`无法加载模板: ${res.status}`);
      const content = await res.text();
      setCurrentFile(fileName);
      setCode(content);
      setShowBgTemplates(false);
    } catch (err) {
      alert(`加载模板失败: ${err.message}`);
    }
  };

  const openFullscreen = () => {
    if (!currentFile) {
      alert('请先选择或加载一个 HTML 文件');
      return;
    }
    if (!currentFile.endsWith('.html')) {
      alert('当前文件不是 HTML，无法全屏预览');
      return;
    }
    try {
      if (previewHtml) {
        const newWin = window.open('', '_blank');
        if (newWin) {
          newWin.document.open();
          newWin.document.write(previewHtml);
          newWin.document.close();
          return;
        }
      }
      const blob = new Blob([code || ''], { type: 'text/html' });
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 20000);
    } catch (err) {
      alert('无法打开全屏预览: ' + err.message);
    }
  };

  const addProject = () => {
    const name = prompt('输入项目名称:');
    if (name) {
      const newProject = { id: Date.now().toString(), name, files: [] };
      setProjects([...projects, newProject]);
      setCurrentProject(newProject.id);
    }
  };

  const deleteProject = (id) => {
    if (projects.length === 1) {
      alert('至少保留一个项目');
      return;
    }
    if (window.confirm(t('confirmDeleteProject'))) {
      setProjects(projects.filter(p => p.id !== id));
      if (currentProject === id) {
        setCurrentProject(projects[0].id);
      }
    }
  };

  const addFile = (parentPath = '') => {
    const name = prompt('输入文件名 (如: index.html, script.js):');
    if (name) {
      const filePath = addFileInternal(name, parentPath, '');
      setCurrentFile(filePath);
      setCode('');
    }
  };

  const addFolder = (parentPath = '') => {
    const name = prompt('输入文件夹名称:');
    if (!name) return;

    const folderPath = parentPath ? `${parentPath}/${name}` : name;
    const newFolder = {
      id: Date.now().toString(),
      name,
      path: folderPath,
      type: 'folder',
      parentPath
    };

    setProjects(prev => prev.map(p =>
      p.id === currentProject
        ? { ...p, files: [...p.files, newFolder] }
        : p
    ));
    setExpandedFolders(prev => ({ ...prev, [folderPath]: true }));

    const htmlPath = addFileInternal('index.html', folderPath, `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>欢迎使用 ${name}</h1>
  <script src="script.js"></script>
</body>
</html>`);

    addFileInternal('style.css', folderPath, `/* ${name} 样式 */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background: #f0f0f0;
}`);

    addFileInternal('script.js', folderPath, `// ${name} 脚本
console.log('${name} 页面加载完成');`);

    setCurrentFile(htmlPath);
    setCode(files[htmlPath] || '');
  };

  const deleteFile = (filePath) => {
    if (window.confirm(t('confirmDeleteFile'))) {
      setProjects(projects.map(p => 
        p.id === currentProject 
          ? { ...p, files: p.files.filter(f => f.path !== filePath && !f.path.startsWith(filePath + '/')) }
          : p
      ));
      
      const newFiles = { ...files };
      delete newFiles[filePath];
      setFiles(newFiles);
      
      if (currentFile === filePath) {
        setCurrentFile(null);
        setCode('');
      }
    }
  };

  const renameItem = (oldPath, isFolder) => {
    const oldName = oldPath.split('/').pop();
    const newName = prompt(`重命名 ${isFolder ? '文件夹' : '文件'}（原名：${oldName}）:`, oldName);
    if (!newName || newName === oldName) return;
    if (newName.includes('/')) {
      alert('名称不能包含 /');
      return;
    }

    const parent = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = parent ? `${parent}/${newName}` : newName;

    const project = getCurrentProject();
    if (project.files.some(f => f.path === newPath)) {
      alert('同名文件/文件夹已存在');
      return;
    }

    const newFiles = { ...files };
    if (files[oldPath] !== undefined) {
      newFiles[newPath] = files[oldPath];
      delete newFiles[oldPath];
    }
    setFiles(newFiles);

    const renameRecursively = (items) => {
      return items.map(item => {
        if (item.path === oldPath) {
          return { ...item, name: newName, path: newPath };
        }
        if (item.path.startsWith(oldPath + '/')) {
          const suffix = item.path.substring(oldPath.length);
          return {
            ...item,
            path: newPath + suffix,
            parentPath: item.parentPath === oldPath ? newPath : item.parentPath
          };
        }
        return item;
      });
    };

    setProjects(prev => prev.map(p =>
      p.id === currentProject
        ? { ...p, files: renameRecursively(p.files) }
        : p
    ));

    if (currentFile === oldPath) {
      setCurrentFile(newPath);
    } else if (currentFile && currentFile.startsWith(oldPath + '/')) {
      setCurrentFile(newPath + currentFile.substring(oldPath.length));
    }
  };

  const saveFile = () => {
    if (currentFile) {
      const updatedFiles = { ...files, [currentFile]: code };
      setFiles(updatedFiles);
      if (onSave) onSave(updatedFiles);
      alert('文件已保存!');
    }
  };

  const downloadFile = () => {
    if (!currentFile || !code) {
      alert('没有可保存的内容');
      return;
    }
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportProject = () => {
    const project = getCurrentProject();
    if (!project) return;
    const projectData = { name: project.name, files: project.files, fileContents: files };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('✅ 项目已导出！');
  };

  const importProject = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;
    
    const currentProj = getCurrentProject();
    if (!currentProj) return;
    
    const firstFile = uploadedFiles[0];
    const originalFolderName = firstFile.webkitRelativePath.split('/')[0] || '导入的文件夹';
    
    const folderSet = new Set();
    let processedCount = 0;
    
    const rootFolder = {
      id: `folder-root-${Date.now()}`,
      name: originalFolderName,
      path: originalFolderName,
      type: 'folder',
      parentPath: ''
    };
    
    setProjects(prev => prev.map(p => 
      p.id === currentProject ? { ...p, files: [...p.files, rootFolder] } : p
    ));
    folderSet.add(originalFolderName);
    
    for (const file of uploadedFiles) {
      const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');
      if (!relativePath) continue;
      
      const fullPath = `${originalFolderName}/${relativePath}`;
      const pathParts = fullPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const parentPath = pathParts.slice(0, -1).join('/');
      
      let currentPath = '';
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        
        if (!folderSet.has(folderPath)) {
          folderSet.add(folderPath);
          setProjects(prev => prev.map(p => 
            p.id === currentProject 
              ? { ...p, files: [...p.files, {
                  id: `folder-${Date.now()}-${Math.random()}`,
                  name: folderName, path: folderPath, type: 'folder', parentPath: currentPath
                }]}
              : p
          ));
        }
        currentPath = folderPath;
      }
      
      const fileObj = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: fileName, path: fullPath, type: 'file', parentPath
      };
      
      setProjects(prev => prev.map(p => 
        p.id === currentProject ? { ...p, files: [...p.files, fileObj] } : p
      ));
      
      await new Promise((resolve) => {
        const isImage = file.type.startsWith('image/');
        const isBinary = !file.type.startsWith('text/') && !file.name.match(/\.(html|css|js|jsx|json|txt|md|svg)$/i);
        
        if (isImage || isBinary) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setFiles(prev => ({ ...prev, [fullPath]: event.target.result }));
            processedCount++;
            resolve();
          };
          reader.readAsDataURL(file);
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            setFiles(prev => ({ ...prev, [fullPath]: event.target.result }));
            processedCount++;
            resolve();
          };
          reader.readAsText(file);
        }
      });
    }
    
    const newFolders = {};
    folderSet.forEach(folder => { newFolders[folder] = true; });
    setExpandedFolders(prev => ({ ...prev, ...newFolders }));
    
    alert(`✅ 文件夹已导入到当前项目！\n导入了 ${processedCount} 个文件`);
    e.target.value = '';
  };

  const getLanguage = (filename) => {
    if (!filename) return 'javascript';
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript', 'jsx': 'jsx', 'ts': 'typescript', 'tsx': 'tsx',
      'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c',
      'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust',
      'sql': 'sql', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml'
    };
    return langMap[ext] || 'javascript';
  };

  const openFile = (filePath) => {
    setCurrentFile(filePath);
    setCode(files[filePath] || '');
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders({ ...expandedFolders, [folderPath]: !expandedFolders[folderPath] });
  };

  const runCode = () => {
    setOutput('正在构建运行环境...');
    
    if (!currentFile || !currentFile.endsWith('.html')) {
      setTimeout(() => {
        try {
          const consoleOutput = [];
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          console.log = (...args) => {
            const output = args.map(arg => {
              if (typeof arg === 'object' && arg !== null) {
                try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            consoleOutput.push(output);
            originalLog(...args);
          };
          
          console.error = (...args) => {
            consoleOutput.push('❌ ' + args.map(String).join(' '));
            originalError(...args);
          };
          
          console.warn = (...args) => {
            consoleOutput.push('⚠️ ' + args.map(String).join(' '));
            originalWarn(...args);
          };

          // eslint-disable-next-line no-eval
          eval(code);
          
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
          
          setOutput(consoleOutput.length > 0 ? consoleOutput.join('\n') : '✅ 代码执行成功，无输出');
        } catch (error) {
          setOutput(`❌ 运行错误:\n${error.message}\n\n堆栈信息:\n${error.stack || '无堆栈信息'}`);
        }
      }, 10);
      return;
    }

    const project = getCurrentProject();
    const vfs = {};
    if (project) {
      project.files.forEach(file => {
        if (file.type === 'file') vfs[file.path] = files[file.path] || '';
      });
    }

    const vfsJson = JSON.stringify(vfs);
    const vfsBase64 = btoa(unescape(encodeURIComponent(vfsJson)));
    
    const shimScript = `<script>
(function() {
  try {
    const vfsData = '${vfsBase64}';
    window.__VFS__ = JSON.parse(decodeURIComponent(escape(atob(vfsData))));
  } catch (e) {
    console.error('VFS 初始化失败:', e);
    window.__VFS__ = {};
  }
})();

const originalFetch = window.fetch;
window.fetch = (resource, options) => {
  const resourceStr = typeof resource === 'string' ? resource : resource.url;
  if (!resourceStr.startsWith('http://') && !resourceStr.startsWith('https://') && 
      !resourceStr.startsWith('blob:') && !resourceStr.startsWith('data:')) {
    const cleanPath = resourceStr.replace(/^\\.\\//g, '').replace(/^\\//g, '');
    let content = window.__VFS__[cleanPath];
    if (!content) {
      const fileName = cleanPath.split('/').pop();
      for (const key in window.__VFS__) {
        if (key === fileName || key.endsWith('/' + fileName)) {
          content = window.__VFS__[key];
          break;
        }
      }
    }
    if (content !== null && content !== undefined) {
      let mimeType = 'text/plain';
      if (cleanPath.endsWith('.json')) mimeType = 'application/json';
      else if (cleanPath.endsWith('.csv')) mimeType = 'text/csv';
      else if (cleanPath.endsWith('.js')) mimeType = 'application/javascript';
      else if (cleanPath.endsWith('.css')) mimeType = 'text/css';
      return Promise.resolve(new Response(content, { status: 200, headers: { 'Content-Type': mimeType }}));
    }
    return Promise.reject(new Error('File not found: ' + cleanPath));
  }
  return originalFetch(resource, options);
};

window.loadFile = function(path) {
  var cleanPath = path.replace(/^\\.\\//g, '').replace(/^\\//g, '');
  if (window.__VFS__[cleanPath]) return window.__VFS__[cleanPath];
  var fileName = cleanPath.split('/').pop();
  for (var key in window.__VFS__) {
    if (key === fileName || key.endsWith('/' + fileName)) return window.__VFS__[key];
  }
  return null;
};
window.loadJSON = function(path) {
  var content = window.loadFile(path);
  return content ? JSON.parse(content) : null;
};
console.log('📁 虚拟文件系统已加载，文件数量:', Object.keys(window.__VFS__).length);
</script>`;

    let processedHtml = code;
    const currentDir = currentFile.split('/').slice(0, -1).join('/');
    
    const cssReplacer = (match, path) => {
      if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) return match;
      const cleanPath = path.replace(/^\.\//, '');
      const fullPath = currentDir ? `${currentDir}/${cleanPath}` : cleanPath;
      let cssContent = vfs[fullPath];
      if (!cssContent) {
        const fileName = cleanPath.split('/').pop();
        for (const key in vfs) {
          if (key === fileName || key.endsWith('/' + fileName)) { cssContent = vfs[key]; break; }
        }
      }
      return cssContent ? `<style>/* Inlined from ${path} */\n${cssContent}\n</style>` : match;
    };
    
    processedHtml = processedHtml.replace(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi, cssReplacer);
    processedHtml = processedHtml.replace(/<link[^>]+href=["']([^"']+\.css)["'][^>]+rel=["']stylesheet["'][^>]*>/gi, cssReplacer);

    const injectStyle = `<style id="kiro-override-styles">
      html, body { overflow-y: visible !important; overflow-x: visible !important; }
    </style>`;
    
    let finalHtml = processedHtml;
    if (/<head[^>]*>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<head([^>]*)>/i, `<head$1>\n${injectStyle}\n${shimScript}`);
    } else if (/<html[^>]*>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<html([^>]*)>/i, `<html$1><head>\n${injectStyle}\n${shimScript}\n</head>`);
    } else {
      finalHtml = `<head>\n${injectStyle}\n${shimScript}\n</head>` + finalHtml;
    }

    setPreviewHtml(finalHtml);
    setOutput('');
  };

  const refresh = () => {
    setOutput('');
    alert(t('editorRefreshed'));
  };

  const applyTemplate = (templateName) => {
    const nameMap = {
      'HTML基础': 'index.html', 'JavaScript文件': 'script.js',
      'CSS样式': 'style.css', 'TODO列表': 'todo.html'
    };
    const fileName = nameMap[templateName] || `${templateName}.txt`;
    const filePath = addFileInternal(fileName, '', TEMPLATES[templateName]);
    setCurrentFile(filePath);
    setCode(TEMPLATES[templateName]);
    setShowTemplates(false);
  };

  // 加载可视化示例项目
  const loadVisualizationExample = (exampleName) => {
    if (!window.confirm(`加载"${exampleName}"示例将清空当前项目，是否继续？`)) {
      return;
    }

    const exampleData = allVisualizationExamples[exampleName];
    if (!exampleData) {
      alert('示例不存在！');
      return;
    }

    // 创建新项目
    const newProjectId = Date.now().toString();
    const fileList = Object.keys(exampleData).map(fileName => ({
      id: `${newProjectId}_${fileName}`,
      name: fileName,
      path: fileName,
      type: 'file',
      parentPath: ''
    }));

    // 设置项目和文件
    setProjects([{
      id: newProjectId,
      name: `可视化示例 - ${exampleName}`,
      files: fileList
    }]);
    setCurrentProject(newProjectId);
    setFiles(exampleData);
    setCurrentFile('index.html');
    setCode(exampleData['index.html']);
    setShowVisualizationExamples(false);
    
    const fileNames = Object.keys(exampleData).join('\n- ');
    alert(interpolate(t('exampleLoaded'), { name: exampleName, files: fileNames }));
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    uploadedFiles.forEach(file => {
      const filePath = file.name;
      const newFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name, path: filePath, type: 'file', parentPath: ''
      };
      
      const isImage = file.type.startsWith('image/');
      const isBinary = !file.type.startsWith('text/') && !file.name.match(/\.(html|css|js|jsx|json|txt|md)$/i);
      
      if (isImage || isBinary) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProjects(projects.map(p => p.id === currentProject ? { ...p, files: [...p.files, newFile] } : p));
          setFiles({ ...files, [filePath]: event.target.result });
          setCurrentFile(filePath);
          setCode(`/* 二进制文件: ${file.name} */\n/* 类型: ${file.type} */\n/* 大小: ${(file.size / 1024).toFixed(2)} KB */`);
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setProjects(projects.map(p => p.id === currentProject ? { ...p, files: [...p.files, newFile] } : p));
          setFiles({ ...files, [filePath]: event.target.result });
          setCurrentFile(filePath);
          setCode(event.target.result);
        };
        reader.readAsText(file);
      }
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const filePath = file.name;
        const newFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name, path: filePath, type: 'file', parentPath: ''
        };
        
        setProjects(prev => prev.map(p => p.id === currentProject ? { ...p, files: [...p.files, newFile] } : p));
        setFiles(prev => ({ ...prev, [filePath]: text }));
        setCurrentFile(filePath);
        setCode(text);
        
        const parsed = d3.csvParse(text);
        setD3Data(parsed);
        alert('✅ CSV 文件已添加到项目！\n文件名: ' + file.name + '\n共 ' + parsed.length + ' 条数据');
      } catch (err) {
        alert('❌ CSV 处理失败：' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = React.useCallback((e) => {
    if (isDragging && containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth >= 20 && newWidth <= 80) setEditorWidth(newWidth);
    }
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => setIsDragging(false), []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderFileTree = (parentPath = '') => {
    const project = getCurrentProject();
    if (!project) return null;
    
    const items = project.files.filter(f => f.parentPath === parentPath);
    
    return items.map(item => (
      <div key={item.id} style={{ marginLeft: parentPath ? '20px' : '0' }}>
        {item.type === 'folder' ? (
          <div>
            <div onClick={() => toggleFolder(item.path)} className="file-tree-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {expandedFolders[item.path] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <Folder size={16} style={{ margin: '0 6px', color: '#f59e0b' }} />
                <span style={{ fontSize: '14px' }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={(e) => { e.stopPropagation(); addFile(item.path); }} className="mini-btn" title="新建文件">
                  <FilePlus size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); renameItem(item.path, true); }} className="mini-btn" title="重命名">
                  <Edit2 size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteFile(item.path); }} className="delete-btn">
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
            </div>
            {expandedFolders[item.path] && renderFileTree(item.path)}
          </div>
        ) : (
          <div onClick={() => openFile(item.path)} className={`file-tree-item ${currentFile === item.path ? 'active' : ''}`}>
            <FileCode size={16} style={{ margin: '0 6px', color: '#3b82f6' }} />
            <span style={{ fontSize: '14px', flex: 1 }}>{item.name}</span>
            <button onClick={(e) => { e.stopPropagation(); renameItem(item.path, false); }} className="mini-btn" title="重命名">
              <Edit2 size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteFile(item.path); }} className="delete-btn">
              <Trash2 size={14} color="#ef4444" />
            </button>
          </div>
        )}
      </div>
    ));
  };

  const currentTheme = THEMES[themeName] || THEMES.dark;
  const containerStyle = {
    display: 'flex', height: '100vh',
    background: currentTheme.background, color: currentTheme.color,
    fontFamily: 'Arial, sans-serif'
  };

  return (
    <div style={containerStyle}>
      <style>{`
        .file-tree-item {
          display: flex; align-items: center; padding: 6px 8px;
          cursor: pointer; border-radius: 4px; transition: background 0.2s;
        }
        .file-tree-item:hover { background: #3c3c3c; }
        .file-tree-item.active { background: #094771; }
        .delete-btn, .mini-btn {
          background: none; border: none; cursor: pointer;
          padding: 4px; display: flex; align-items: center;
          border-radius: 3px; transition: background 0.2s;
        }
        .mini-btn { color: #fff; }
        .mini-btn:hover { background: rgba(255,255,255,0.1); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.1); }
        .toolbar-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; padding: 8px; background: #0e639c; color: #fff;
          border: none; border-radius: 4px; cursor: pointer; fontSize: 12px;
          transition: background 0.2s;
        }
        .toolbar-btn:hover { background: #0a507e; }
        .action-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; color: #fff; border: none;
          border-radius: 4px; cursor: pointer; fontSize: 13px;
          font-weight: 500; transition: opacity 0.2s;
        }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .action-btn:not(:disabled):hover { opacity: 0.9; }
        .divider {
          width: 4px; background: #3e3e42; cursor: col-resize;
          position: relative; display: flex; align-items: center;
          justify-content: center; transition: background 0.2s;
        }
        .divider:hover, .divider.dragging { background: #0e639c; }
      `}</style>

      {/* 侧边栏 */}
      <div style={{ width: '280px', background: '#252526', borderRight: '1px solid #3e3e42', display: 'flex', flexDirection: 'column' }}>
        {/* 项目管理 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #3e3e42' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <select value={currentProject} onChange={(e) => setCurrentProject(e.target.value)}
              style={{ flex: 1, padding: '6px', background: '#3c3c3c', color: '#fff', border: '1px solid #555', borderRadius: '4px', fontSize: '13px' }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={addProject} style={{ marginLeft: '8px', padding: '6px 10px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>新建</button>
          </div>
          {projects.length > 1 && (
            <button onClick={() => deleteProject(currentProject)} style={{ width: '100%', padding: '6px', background: '#c92a2a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>{t('deleteCurrentProject')}</button>
          )}
        </div>

        {/* 工具栏 */}
        <div style={{ padding: '12px', borderBottom: '1px solid #3e3e42', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button onClick={() => addFile()} className="toolbar-btn"><FilePlus size={16} /> 新建文件</button>
          <button onClick={() => addFolder()} className="toolbar-btn"><FolderPlus size={16} /> 新建文件夹</button>
          <button onClick={() => fileInputRef.current?.click()} className="toolbar-btn"><Upload size={16} /> 上传文件</button>
          <button onClick={refresh} className="toolbar-btn"><RefreshCw size={16} /> 刷新</button>
          <button onClick={exportProject} className="toolbar-btn"><PackageOpen size={16} /> 导出项目</button>
          <button onClick={() => projectInputRef.current?.click()} className="toolbar-btn"><PackagePlus size={16} /> 导入项目</button>
          <button onClick={() => setShowTemplates(!showTemplates)} className="toolbar-btn"><FileCode size={16} /> 模板</button>
          <button onClick={() => setShowBgTemplates(!showBgTemplates)} className="toolbar-btn"><Folder size={16} /> 背景模板</button>
          <button onClick={() => csvInputRef.current?.click()} className="toolbar-btn"><Upload size={16} /> 上传 CSV</button>
          <button 
            onClick={() => setShowVisualizationExamples(!showVisualizationExamples)} 
            className="toolbar-btn" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: '600'
            }}
            title="加载D3.js可视化示例项目"
          >
            <BarChart3 size={16} /> 可视化示例
          </button>
        </div>

        <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} accept=".html,.css,.js,.jsx,.json,.txt,.md" />
        <input ref={projectInputRef} type="file" onChange={importProject} style={{ display: 'none' }} webkitdirectory="" directory="" multiple />
        <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleCsvUpload} style={{ display: 'none' }} />

        {showTemplates && (
          <div style={{ padding: '12px', borderBottom: '1px solid #3e3e42', background: '#2d2d30' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>选择模板:</div>
            {Object.keys(TEMPLATES).map(name => (
              <button key={name} onClick={() => applyTemplate(name)}
                style={{ width: '100%', padding: '8px', marginBottom: '4px', background: '#3c3c3c', color: '#fff', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', fontSize: '12px' }}>
                {name}
              </button>
            ))}
          </div>
        )}

        <BackgroundTemplates show={showBgTemplates} loadTemplate={loadBgTemplate} />

        {/* 可视化示例选择窗口 */}
        {showVisualizationExamples && (
          <div style={{ padding: '12px', borderBottom: '1px solid #3e3e42', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} />
              选择可视化示例:
            </div>
            {Object.keys(allVisualizationExamples).map(name => (
              <button 
                key={name} 
                onClick={() => loadVisualizationExample(name)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  marginBottom: '8px', 
                  background: 'rgba(255,255,255,0.95)', 
                  color: '#333', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  textAlign: 'left', 
                  fontSize: '13px',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.95)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                📊 {name}
              </button>
            ))}
          </div>
        )}

        {/* 文件树 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#ccc' }}>文件资源管理器</div>
          {renderFileTree()}
        </div>
      </div>

      {/* 编辑器区域 */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶部工具栏 */}
        <div style={{ padding: '12px', background: '#2d2d30', borderBottom: '1px solid #3e3e42', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onBack && (
            <button onClick={onBack} className="action-btn" style={{ background: '#6b7280', marginRight: '10px' }} title="返回到管理界面">
              <ArrowLeft size={16}/> 返回
            </button>
          )}
          <span style={{ fontSize: '14px', color: '#ccc', fontWeight: '500' }}>{currentFile || '未选择文件'}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button onClick={saveFile} disabled={!currentFile} className="action-btn" style={{ background: currentFile ? '#0e639c' : '#555' }}>
              <Save size={16} /> 保存
            </button>
            <button onClick={downloadFile} disabled={!currentFile} className="action-btn" style={{ background: currentFile ? '#7c3aed' : '#555' }}>
              <Download size={16} /> {t('downloadFile')}
            </button>
            <button onClick={runCode} disabled={!currentFile} className="action-btn" style={{ background: currentFile ? '#16a34a' : '#555' }}>
              <Play size={16} /> 运行
            </button>
            <button onClick={openFullscreen} disabled={!currentFile} className="action-btn" style={{ background: currentFile ? '#0b5cff' : '#555' }}>
              全屏
            </button>
            {/* 学生提交按钮 */}
            {mode === 'student_work' && onSubmit && (
              <button onClick={() => setShowSubmitModal(true)} className="action-btn"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)' }}>
                <Send size={16} /> {t('submitAssignment')}
              </button>
            )}
          </div>
        </div>

        {/* 编辑器和输出 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 代码编辑器 */}
          <div style={{ width: `${editorWidth}%`, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <textarea value={code} onChange={(e) => setCode(e.target.value)}
              onScroll={(e) => {
                const highlightDiv = document.querySelector('.code-highlight-display');
                if (highlightDiv) {
                  highlightDiv.scrollTop = e.target.scrollTop;
                  highlightDiv.scrollLeft = e.target.scrollLeft;
                }
              }}
              placeholder="在左侧创建或选择文件开始编码..."
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                padding: '16px', paddingLeft: '60px', background: 'transparent',
                color: 'transparent', caretColor: '#fff', border: 'none',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '14px', lineHeight: '1.6', resize: 'none', outline: 'none',
                zIndex: 2, whiteSpace: 'pre', overflow: 'auto', WebkitTextFillColor: 'transparent'
              }}
              spellCheck="false"
            />
            <div className="code-highlight-display" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              overflow: 'hidden', pointerEvents: 'none', zIndex: 1
            }}>
              <SyntaxHighlighter language={getLanguage(currentFile)} style={vscDarkPlus}
                customStyle={{
                  margin: 0, padding: '16px', background: '#1e1e1e', fontSize: '14px',
                  lineHeight: '1.6', fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  minHeight: '100%', overflow: 'visible'
                }}
                showLineNumbers={true} wrapLines={false} PreTag="div">
                {code || ''}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* 分隔条 */}
          <div className={`divider ${isDragging ? 'dragging' : ''}`} onMouseDown={handleMouseDown}>
            <GripVertical size={16} color="#888" />
          </div>

          {/* 输出面板 */}
          <div style={{ width: `${100 - editorWidth}%`, background: '#1e1e1e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '12px', background: '#2d2d30', borderBottom: '1px solid #3e3e42', fontSize: '13px', fontWeight: 'bold' }}>输出</div>
            <div style={{ flex: 1, overflow: 'auto', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.5' }}>
              {currentFile && currentFile.endsWith('.html') ? (
                previewHtml ? (
                  <iframe ref={iframeRef} title="preview" srcDoc={previewHtml}
                    style={{ width: '100%', height: '100%', border: 'none', background: 'white', display: 'block' }} />
                ) : (
                  <div style={{ color: '#d4d4d4', padding: '16px' }}>点击「运行」来预览 HTML 页面</div>
                )
              ) : (
                <div style={{ color: '#d4d4d4', padding: '16px' }}>
                  {output || '点击「运行」按钮执行代码\n\n支持：\n• JavaScript 代码执行\n• HTML 页面预览\n• console.log 输出显示'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 文件选择提交模态框 */}
      {showSubmitModal && (
        <SubmitModal
          show={showSubmitModal}
          files={files}
          projectFiles={getCurrentProject()?.files || []}
          onClose={() => setShowSubmitModal(false)}
          onSubmit={async (selectedFiles) => {
            if (onSubmit) {
              await onSubmit(selectedFiles);
            }
          }}
        />
      )}
    </div>
  );
}

export default FullEditor;