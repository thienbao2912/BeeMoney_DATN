// src/App.js

import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  RouterProvider,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';


function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        
      </>

    )
  );

  return <RouterProvider router={router} />;
}

export default App;
