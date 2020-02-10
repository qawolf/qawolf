function Home() {
  if (typeof window !== "undefined") {
    // redirect to Home page
    window.location.href = "https://www.qawolf.com";
  }

  return null;
}

export default Home;
