import React, { useState } from "react";
import "./App.css";
const IP = "172.233.148.151";

const App = () => {
  const [link, setLink] = useState("");
  const [data, setData] = useState([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value.split("/").pop();
    setLink("https://feelthemusi.com/api/v4/playlists/fetch/" + code);
  };

  const downloadAudio = async (pLink) => {
    try {
      // Define the FastAPI endpoint
      const apiUrl = "http://" + IP + ":8000/download/";

      // Send a POST request to the FastAPI server
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://www.youtube.com/watch?v=" + pLink,
        }),
      });

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Retrieve the MP3 file as a Blob
      const blob = await response.blob();

      // Extract the filename from the 'Content-Disposition' header
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "downloaded_audio.mp3"; // Default filename
      console.log(response);
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }

      // Create a download link and trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;

      // Append the link to the body, click it, and remove it
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(downloadUrl);
      console.log("Download started successfully!");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  async function downloadAll() {
    const videoUrls = data.map(
      (item) => `https://www.youtube.com/watch?v=${item.video_id}`
    );
    downloadAllAudio(videoUrls);
  }

  async function downloadAllAudio(videoUrls) {
    try {
      // Define the FastAPI endpoint for downloading all videos
      const apiUrl = "http://" + IP + ":8000/download_all/";

      // Prepare the data for the POST request
      const requestData = videoUrls.map((videoUrl) => ({ url: videoUrl }));

      // Send a POST request to the FastAPI server
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Retrieve the ZIP file as a Blob
      const blob = await response.blob();

      // Set the filename for the ZIP file
      const fileName = "audio_files.zip";

      // Create a download link and trigger the download
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;

      // Append the link to the body, click it, and remove it
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL to free up memory
      URL.revokeObjectURL(downloadUrl);
      console.log(`Download started for ${fileName}`);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  return (
    <div className="app">
      <input type="text" id="link" onChange={handleInputChange} />
      <button
        onClick={async () => {
          const fetchedData = await fetchMusiData(link);
          if (fetchedData) {
            setData(fetchedData);
          }
        }}
      >
        Submit
      </button>
      <button onClick={downloadAll}>Download All</button>
      <div className="music-list">
        {data.map((item, index) => (
          <div key={index} className="music-item">
            <img
              src={`https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`}
              alt={item.video_name}
            />
            <div className="right">
              <p>{item.video_name}</p>
              <button
                className="download"
                onClick={() => {
                  downloadAudio(item.video_id);
                }}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

async function fetchMusiData(link: string) {
  try {
    // Fetch Data from API
    const proxyUrl =
      "http://" + IP + ":8000/proxy?url=" + encodeURIComponent(link);
    const response = await fetch(proxyUrl);
    // Check if there is an error
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    // Convert Data to JSON and display
    const data = await response.json();
    const playlist = JSON.parse(data.success.data);
    return playlist.data;
  } catch (error) {
    console.error("Error: " + error);
  }
}
