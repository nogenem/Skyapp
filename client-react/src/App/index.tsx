import React from "react";

import { Router } from "~/components";
import { Signup } from "~/pages";

function App() {
  return (
    <main>
      <Router>
        <Signup path="/signup" />
      </Router>
    </main>
  );
}

export default App;
