import React, {Component} from 'react';
import FlipCard from './FlipCard';
import Swiper from './Swiper';
import * as CardActions from '../actions/CardActions';
import CardStore from '../stores/CardStore';
import {markdown} from 'markdown';
import {getLibretto} from '../utils/ajax';

//styles
import './App.scss';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      librettoParts: [],
      position: 0
    };
    CardStore.on('NEW_DECK', this.renderCards.bind(this));
  }

  getLibretto (libName) {
    getLibretto(libName).then(text => {
      CardActions.makeDeck(text);
      this.setState({
        libretto: text
      });
    })
  }

  renderCards() {
    let cards = CardStore.getCards();
    if (cards.length === 0) return null;
    const height = 600;
    const width = 300;

    let renderedCards = cards.map(([front, back], i) => {
      return (
        <div style={{width:`${width}px`, height:`${height}px`}} key={i}>
          <FlipCard front={ front } back={ back }/>
        </div>
      )
    });
    this.setState({renderedCards})
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
    if (!this.state.renderedCards) return this.renderChooser();
    let libretto = this.state.libretto ? markdown.toHTML(this.state.libretto) : null ;
    return (
      <div className="thinkSystem-App">
        <Swiper cards={ this.state.renderedCards }/>
        <div dangerouslySetInnerHTML={{__html: libretto}} />
      </div>
    )
  }
}

export default App;
