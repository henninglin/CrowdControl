import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const ChartComponent = () => {
  const artistChartRef = useRef(null);
  const genreChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const partyKeyword = localStorage.getItem('partyKeyword');

      const partySongsRef = collection(db, 'Parties', partyKeyword, 'searchedSongs');
      const songSnapshot = await getDocs(partySongsRef);
      const songs = songSnapshot.docs.map((doc) => doc.data());

      const artistCounts = {};
      const genreCounts = {};
      songs.forEach((song) => {
        if (!artistCounts[song.artist]) {
          artistCounts[song.artist] = 0;
        }
        artistCounts[song.artist]++;

        if (!genreCounts[song.genre]) {
          genreCounts[song.genre] = 0;
        }
        genreCounts[song.genre]++;
      });

      const sortedArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const artistLabels = sortedArtists.map((artist) => artist[0]);
      const artistCountsData = sortedArtists.map((artist) => artist[1]);

      const genreLabels = sortedGenres.map((genre) => genre[0]);
      const genreCountsData = sortedGenres.map((genre) => genre[1]);

      // Update the chart data in Firestore every 5 minutes
      setInterval(async () => {
        try {
          const chartDataRef = doc(db, 'Parties', partyKeyword, 'ChartData');
          await setDoc(chartDataRef, {
            artist: {
              labels: artistLabels,
              counts: artistCountsData,
              timestamp: serverTimestamp(),
            },
            genre: {
              labels: genreLabels,
              counts: genreCountsData,
              timestamp: serverTimestamp(),
            },
          });
          console.log('Chart data stored in Firebase');
        } catch (error) {
          console.error('Error storing chart data:', error);
        }
      }, 300000);

      // Create the charts using Chart.js
      new Chart(artistChartRef.current, {
        type: 'pie',
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
      });

      new Chart(genreChartRef.current, {
        type: 'pie',
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
      });
    };

    fetchData();
  }, []);

  return (
    <div>
      <canvas ref={artistChartRef} className="chart mb-3" />
      <canvas ref={genreChartRef} className="chart" />
    </div>
  );
};

export default ChartComponent;
