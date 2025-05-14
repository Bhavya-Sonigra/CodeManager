import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Problemlist from './pages/Problemlist';
import AddProblem from './pages/AddProblem';
import './App.css';

function App(){
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Problemlist />} />
          <Route path="/add" element={<AddProblem/>}></Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;