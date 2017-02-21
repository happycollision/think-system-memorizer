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
    getLibretto(libName).then(text => this.makeDeckAndDisplayText(text))
  }

  makeDeckAndDisplayText(text){
    CardActions.makeDeck(text);
    this.setState({
      libretto: text
    });
  }

  renderCards () {
    let cards = CardStore.getCards();
    if (cards.length === 0) return null;
    const height = mediaHeight() - 80;
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
        <button type="button" onClick={ () => this.getLibretto('MusicManHaroldHill') }>Music Man: Harold's Lines</button>
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
