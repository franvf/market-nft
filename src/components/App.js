import React, { Component } from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Header from './Header';
import Index from './Index';
import Creator from './Creator';
import Offers from './Offers';
import Ownership from './Ownership';
import PDF from './pdf';
import 'semantic-ui-css/semantic.min.css';

class App extends Component {

  render(){
    return(
      <BrowserRouter>
        <container>
          <Header />
          <main>
            <Routes>
              <Route exact path="/" element={<Index />}/>
              <Route exact path="/Creator" element={<Creator />}/>
              <Route exact path="/Offers" element={<Offers />}/>
              <Route exact path="/Ownership" element={<Ownership />}/>
              <Route exact path="/pdf" element={<PDF />}/>
            </Routes>
          </main>
        </container>
      </BrowserRouter>
    );
  }

}

export default App;
