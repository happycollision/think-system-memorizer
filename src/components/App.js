import React, {Component} from 'react';
import FlipCard from './FlipCard';
import Swiper from './Swiper';
import {getLibretto} from '../utils/ajax';
import {makeParts} from '../utils/textInterpreter';

//styles
import './App.scss';

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
    this.state = {
      librettoParts: []
    }
    getLibretto('MusicManAct1').then(text => {
      this.setState({librettoParts: text})
    });
  }

  renderCards() {
    const array = makeParts(this.state.librettoParts);
    if (array.length === 0) return null;
    
    let cards = array.map(([front, back], i) => {
      return (
        <div style={{width:'300px', height:'600px'}} key={i}>
          <FlipCard front={ front } back={ back }/>
        </div>
      )
    });
    return <Swiper cards={ cards }/>;
  }

  render() {
    let swiper = this.renderCards();
    return (
      <div className="thinkSystem-App">
        { swiper }
      </div>
    )
  }
}

export default App;
