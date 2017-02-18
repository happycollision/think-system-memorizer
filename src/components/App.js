import React, {Component} from 'react';
import FlipCard from './FlipCard';
import Swiper from './Swiper';
import {markdown} from 'markdown';
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
  }

  getLibretto (libName) {
    getLibretto(libName).then(text => {
      this.setState({
        libretto: text,
        librettoParts: makeParts(text)
      });
    })
  }

  renderCards() {
    const array = this.state.librettoParts;
    const height = 600;
    const width = 300;
    if (array.length === 0) return null;

    let cards = array.map(([front, back], i) => {
      return (
        <div style={{width:`${width}px`, height:`${height}px`}} key={i}>
          <FlipCard front={ front } back={ back }/>
        </div>
      )
    });
    return <Swiper cards={ cards }/>;
  }

  renderChooser() {
    return (
      <div className="thinkSystem-App">
        <button type="button" onClick={ () => this.getLibretto('MusicManAct1') }>MM Act 1</button>
        <button type="button" onClick={ () => this.getLibretto('MusicManAct2') }>MM Act 2</button>
      </div>
    );
  }

  render() {
    if (!this.state.libretto) return this.renderChooser();
    let swiper = this.renderCards();
    let libretto = this.state.libretto ? markdown.toHTML(this.state.libretto) : null ;
    return (
      <div className="thinkSystem-App">
        { swiper }
        <div dangerouslySetInnerHTML={{__html: libretto}} />
      </div>
    )
  }
}

export default App;
