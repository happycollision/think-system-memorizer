import React, {Component} from 'react';
import FlipCard from './FlipCard';
import SwiperContainer from './SwiperContainer';
import * as CardActions from '../actions/CardActions';
import CardStore from '../stores/CardStore';
import {markdown} from 'markdown';
import {getLibretto} from '../utils/ajax';
import {mediaHeight} from '../utils/helper-functions';

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
    const height = mediaHeight() - 40;
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
        <button type="button" onClick={ () => this.getLibretto('MusicManHaroldHill') }>Music Man: Harold's Lines</button>
        <button type="button" onClick={ () => this.getLibretto('MusicManMarian') }>Music Man: Marian's Lines</button>
      </div>
    );
  }

  render() {
    if (!this.state.renderedCards) return this.renderChooser();
    let libretto = this.state.libretto ? markdown.toHTML(this.state.libretto) : null ;
    return (
      <div className="thinkSystem-App">
        <SwiperContainer cards={ this.state.renderedCards }/>
        <div dangerouslySetInnerHTML={{__html: libretto}} />
      </div>
    )
  }
}

export default App;
