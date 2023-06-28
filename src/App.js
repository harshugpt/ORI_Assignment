import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Grid, CircularProgress } from "@mui/material";
import { Autocomplete } from "@mui/material";
import PhotoModal from "./PhotoModal";

const API_KEY = "81161005f756021ff86f1609fa88782c";

function App() {
  const [searchText, setSearchText] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [savedQueries, setSavedQueries] = useState([]);

  useEffect(() => {
    const savedQueriesJSON = localStorage.getItem("savedQueries");
    if (savedQueriesJSON) {
      setSavedQueries(JSON.parse(savedQueriesJSON));
    }
  }, []);

  useEffect(() => {
    fetchRecentPhotos();
  }, []);

  const fetchRecentPhotos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${API_KEY}&safe_search=1&format=json&nojsoncallback=1`
      );
      setPhotos(response.data.photos.photo);
    } catch (error) {
      console.error("Error fetching recent photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${API_KEY}&safe_search=1&format=json&nojsoncallback=1&text=${query}`
      );
      setPhotos(response.data.photos.photo);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event, value) => {
    setSearchText(value || "");
    if (value) {
      fetchSearchResults(value);
    } else {
      fetchRecentPhotos();
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      loadMoreResults();
    }
  };

  const loadMoreResults = async () => {
    if (loading || photos.length === 0) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=${API_KEY}&safe_search=1&format=json&nojsoncallback=1&page=${
          page + 1
        }`
      );
      setPhotos((prevPhotos) => [...prevPhotos, ...response.data.photos.photo]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error loading more results:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    setModalOpen(false);
  };

  useEffect(() => {
    if (searchText) {
      const savedQueriesSet = new Set(savedQueries);
      savedQueriesSet.add(searchText);
      setSavedQueries(Array.from(savedQueriesSet));
      localStorage.setItem(
        "savedQueries",
        JSON.stringify(Array.from(savedQueriesSet))
      );
    }
  }, [searchText, savedQueries]);

  return (
    <div
      onScroll={handleScroll}
      style={{
        maxHeight: "100vh",
        overflow: "auto",
      }}
    >
      <Container
        style={{ position: "sticky", top: 0, zIndex: 1, background: "#fff" }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          style={{ marginBottom: "20px" }}
        >
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              options={savedQueries}
              value={searchText}
              onChange={handleSearch}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </Grid>
        </Grid>
      </Container>

      <Container>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2}>
            {photos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                <img
                  src={`https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`}
                  alt={photo.title}
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() => openModal(photo)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <PhotoModal open={modalOpen} photo={selectedPhoto} onClose={closeModal} />
    </div>
  );
}

export default App;
