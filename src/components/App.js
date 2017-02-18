import React, {Component} from 'react';
import FlipCard from './FlipCard';
import ReactSwipe from 'react-swipe';
import {getLibretto} from '../utils/ajax';

//styles
import './App.scss';

function makeParts (text) {
  const regex = /^(?:(?!HH:)[\s\S])+HH:.*$/gm;
  let m;
  let a = [];
  let split;
  function addSplitsToArray (match) {
    split = match.split('HH:');
    a.push([split[0], split[1]]);
  }

  // eslint-disable-next-line
  while ((m = regex.exec(text)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    
    // The result can be accessed through the `m`-variable.
    m.forEach(addSplitsToArray);
  }
  return a;
}

// const swipeOptions = {
//   startSlide: startSlide < paneNodes.length && startSlide >= 0 ? startSlide : 0,
//   auto: parseInt(query.auto, 10) || 0,
//   speed: parseInt(query.speed, 10) || 300,
//   disableScroll: query.disableScroll === 'true',
//   continuous: query.continuous === 'true',
//   callback() {
//     console.log('slide changed');
//   },
//   transitionEnd() {
//     console.log('ended transition');
//   }
// };

class App extends Component {
  constructor(props) {
    super(props)
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.state = {
      librettoParts: []
    }
    getLibretto('MusicManAct1').then(text => {
      this.setState({librettoParts: makeParts(text)})
    });
  }
  
  next() {
    this.refs.reactSwipe.next();
  }

  prev() {
    this.refs.reactSwipe.prev();
  }
  
  renderCards() {
    const array = this.state.librettoParts;
    if (array.length === 0) return null;
    
    let cards = array.map(([front, back]) => {
      return (
        <div className="App" style={{width:'300px', height:'600px'}}>
          <FlipCard>
            <div>
              {front}
            </div>
            <div>
              {back}
            </div>
          </FlipCard>
        </div>
      )
    });
    return (
      <ReactSwipe ref="reactSwipe" className="carousel" swipeOptions={{continuous: false}}>
        { cards }
      </ReactSwipe>
    )
  }

  render() {
    let cards = this.renderCards();
    return (
      <div>
        {cards}
        <div>
          <button type="button" onClick={this.prev}>Prev</button>
          <button type="button" onClick={this.next}>Next</button>
        </div>
      </div>
    )
  }
}

export default App;
