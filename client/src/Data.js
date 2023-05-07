import React, { Component } from 'react';
import { Chart } from 'chart.js/auto';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

class ChartComponent extends Component {
  
  artistChartRef = React.createRef();
  genreChartRef = React.createRef();

  async componentDidMount() {
    const artistChartRef = this.artistChartRef.current.getContext('2d');
    const genreChartRef = this.genreChartRef.current.getContext('2d');

    const partyKeyword = localStorage.getItem("partyKeyword");

    const partySongsRef = collection(db, "Parties", partyKeyword, "searchedSongs");
    const songSnapshot = await getDocs(partySongsRef);
    const songs = songSnapshot.docs.map(doc => doc.data());

    const artistCounts = {};
    const genreCounts = {};
    songs.forEach(song => {
      if (!artistCounts[song.artist]) {
        artistCounts[song.artist] = 0;
      }
      artistCounts[song.artist]++;

      if (!genreCounts[song.genre]) {
        genreCounts[song.genre] = 0;
      }
      genreCounts[song.genre]++;
    });

    // Convert the objects to arrays and sort them to get the top 5 artists and genres
    const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const artistLabels = sortedArtists.map(artist => artist[0]);
    const artistCountsData = sortedArtists.map(artist => artist[1]);

    const genreLabels = sortedGenres.map(genre => genre[0]);
    const genreCountsData = sortedGenres.map(genre => genre[1]);

    // Top 5 Artists Pie Chart
    new Chart(artistChartRef, {
      type: 'pie',
      options: {
        aspectRatio: 1,
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 5 Artists by Users',
            font: {
              size: 20,
            },
          },
        },
      },
      data: {
        labels: artistLabels,
        datasets: [
          {
            label: 'Number of Songs',
            data: artistCountsData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
    });

        // Top 5 Genres Pie Chart
    new Chart(genreChartRef, {
      type: 'pie',
      options: {
        aspectRatio: 1,
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 5 Genres by Users',
            font: {
              size: 20,
            },
          },
        },
      },
      data: {
        labels: genreLabels,
        datasets: [
          {
            label: 'Number of Songs',
            data: genreCountsData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  }

  render() {
    return (
      <div>
        <canvas ref={this.artistChartRef} className="chart mb-3" />
        <canvas ref={this.genreChartRef} className="chart" />
      </div>
    );
  }
}

export default ChartComponent;
