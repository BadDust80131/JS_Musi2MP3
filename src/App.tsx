import React, { useState } from "react";
import "./App.css";

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
      const apiUrl = "http://192.168.68.111:8000/download/";

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
      "http://192.168.68.111:8000/proxy?url=" + encodeURIComponent(link);
    const response = await fetch(proxyUrl);
    // Check if there is an error
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    // Convert Data to JSON and display
    const data = await response.json();
    const playlist = JSON.parse(data.success.data);
    return playlist.data;
    console.log(
      "https://img.youtube.com/vi/" +
        playlist.data[0].video_id +
        "/hqdefault.jpg"
    );
  } catch (error) {
    console.error("Error: " + error);
  }
}
