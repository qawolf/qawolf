function Home() {
  if (typeof window !== 'undefined') {
    // redirect to Home page
    window.location.href = 'https://v1-docs.qawolf.com/docs/install';
  }

  return null;
}

export default Home;
