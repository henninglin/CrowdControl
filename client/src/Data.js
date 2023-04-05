import React, { Component } from 'react';
import { Chart } from 'chart.js/auto';

class ChartComponent extends Component {
  
  chartRef = React.createRef();

  componentDidMount() {
    const myChartRef = this.chartRef.current.getContext('2d');

    const genres = [
      { genre: "Pop", count: 120 },
      { genre: "Hip Hop", count: 90 },
      { genre: "Rock", count: 70 },
      { genre: "EDM", count: 50 },
      { genre: "Country", count: 30 },
      { genre: "Classical", count: 10 }
    ];

    const genreLabels = genres.map((genre) => genre.genre);
    const genreCounts = genres.map((genre) => genre.count);

    new Chart(myChartRef, {
      type: 'pie',
      data: {
        labels: genreLabels,
        datasets: [
          {
            label: 'Genres',
            data: genreCounts,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  }

  render() {
    return <canvas ref={this.chartRef} className="chart"/>;
  }
}

export default ChartComponent;