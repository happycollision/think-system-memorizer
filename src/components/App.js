import React, {Component} from 'react';
import FlipCard from './FlipCard';
import SwiperContainer from './SwiperContainer';
import Libretto from './Libretto';
import * as CardActions from '../actions/CardActions';
import * as StateActions from '../actions/StateActions';
import CardStore from '../stores/CardStore';
import StateStore from '../stores/StateStore';
import {getLibretto} from '../utils/ajax';
import {mediaHeight} from '../utils/helper-functions';

//styles
import './App.scss';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      librettoParts: []
    };
    this.handleToggleCardsOpen = this.handleToggleCardsOpen.bind(this);
    this.setStateViaStore = this.setStateViaStore.bind(this);
    this.renderCards = this.renderCards.bind(this);
  }

  setStateViaStore() {
    this.setState(StateStore.getState(['cardsAreOpen']));
  }

  componentDidMount() {
    CardStore.on('NEW_DECK', this.renderCards);
    StateStore.on('STATE_UPDATED', this.setStateViaStore);
  }

  componentWillUnmount() {
    CardStore.removeListener('NEW_DECK', this.renderCards);
    StateStore.removeListener('STATE_UPDATED', this.setStateViaStore);
  }

  getLibretto (libName) {
    getLibretto(libName).then(text => this.makeDeckAndDisplayText(text))
  }

  handleToggleCardsOpen() {
    StateActions.setState({cardsAreOpen: !this.state.cardsAreOpen})
  }

  makeDeckAndDisplayText(text){
    CardActions.makeDeck(text);
    this.setState({
      libretto: text
    }, this.handleToggleCardsOpen);
  }

  renderCards () {
    let cards = CardStore.getCards();
    if (cards.length === 0) return null;
    const height = mediaHeight() - 80;
    const width = 300;

    let renderedCards = cards.map(([front, back], i) => {
      return (
        <div style={{width:`${width}px`, height:`${height}px`}} key={i}>
          <FlipCard front={ front } back={ back } index={ i }/>
        </div>
      )
    });
    this.setState({renderedCards})
  }

  submitTextArea() {
    this.makeDeckAndDisplayText(this.refs.textArea.value);
  }

  handleChangeFile (e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      console.log(reader.result)
      this.makeDeckAndDisplayText(reader.result);
    }

    reader.readAsText(file)
  }

  renderChooser() {
    return (
      <div className="thinkSystem-App">
        <button type="button" onClick={ () => this.getLibretto('Grease') }>Grease</button>
        <br/>
        <button type="button" onClick={ () => this.getLibretto('MusicManHaroldHill') }>Music Man: Harold's Lines</button>
        <br/>
        <button type="button" onClick={ () => this.getLibretto('ZombieProm') }>Zombie Prom</button>
        <br/>
        <button type="button" onClick={ () => this.getLibretto('MusicManMarian') }>Music Man: Marian's Lines</button>
        <br/>
        <br/>
        <input type="file" onChange={this.handleChangeFile.bind(this)}/>
        <br/>
        <br/>

        <textarea ref="textArea" defaultValue={'You can try it out inside here. Anything above a line that starts with a ">" and then contains a ":" will be the front.\n\n>Charater Name: The back will be anything on the line with the greater than symbol which followed by a colon.'}/>

        <input type="button" onClick={this.submitTextArea.bind(this)} value="Submit Text"/>
      </div>
    );
  }

  render() {
    if (!this.state.renderedCards) return this.renderChooser();
    let librettoStyle = {display: 'block'};
    if (this.state.cardsAreOpen) {
      librettoStyle.display = 'none';
    }
    return (
      <div className="thinkSystem-App">
        <SwiperContainer
          cards={ this.state.renderedCards }
          onToggleCardsOpen={ this.handleToggleCardsOpen }
          isOpen={ this.state.cardsAreOpen }/>
        <Libretto />
      </div>
    )
  }
}

export default App;
