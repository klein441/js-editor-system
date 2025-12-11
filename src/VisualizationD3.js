import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function VisualizationD3({ data, width = 800, height = 400 }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // 清空之前的内容
    d3.select(svgRef.current).selectAll('*').remove();

    // 设置边距
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 创建 SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 数据转换（确保 x 和 y 是数字）
    const processedData = data.map(d => ({
      x: +d.x,
      y: +d.y,
      label: d.label || ''
    }));

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.x) * 1.1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.y) * 1.1])
      .range([innerHeight, 0]);

    // 添加 X 轴
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 35)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .text('X 轴');

    // 添加 Y 轴
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -35)
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .text('Y 轴');

    // 绘制散点
    g.selectAll('circle')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 6)
      .attr('fill', 'steelblue')
      .attr('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('fill', 'orange');
        
        // 显示提示信息
        g.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.x))
          .attr('y', yScale(d.y) - 15)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .text(`${d.label}: (${d.x}, ${d.y})`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 6)
          .attr('fill', 'steelblue');
        
        g.selectAll('.tooltip').remove();
      });

    // 添加标签
    g.selectAll('text.label')
      .data(processedData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y) - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .text(d => d.label);

  }, [data, width, height]);

  return (
    <svg ref={svgRef} style={{ background: '#1e1e1e', borderRadius: '4px' }}></svg>
  );
}

export default VisualizationD3;
