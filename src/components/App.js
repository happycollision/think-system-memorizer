import React, {Component} from 'react';
import FlipCard from './FlipCard';

//styles
import './App.scss';

class App extends Component {
  render() {
    return (
      <div className="App" style={{width:'300px', height:'300px'}}>
        <FlipCard>
          <div>
            Hello
          </div>
          <div>
            There
          </div>
        </FlipCard>
      </div>
    )
  }
}

export default App;
