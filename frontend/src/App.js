import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Problemlist from './pages/Problemlist';
import AddProblem from './pages/AddProblem';
import EditProblem from './pages/EditProblem';
import ProblemSolver from './pages/ProblemSolver';
import './App.css';
import './styles/theme.css';

function App(){
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Problemlist />} />
          <Route path="/problems" element={<Problemlist />} />
          <Route path="/add" element={<AddProblem/>} />
          <Route path="/edit/:id" element={<EditProblem />} />
          <Route path="/solve/:id" element={<ProblemSolver />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;