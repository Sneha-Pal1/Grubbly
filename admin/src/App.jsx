import React from "react";
import Navbar from "./components/Navbar/Navbar";
import sidebar from "./components/sidebar/sidebar";

const App = () => {
  return (
    <div>
      <Navbar />
      <hr />
      <div className="app-content">
        <sidebar />
      </div>
    </div>
  );
};

export default App;
