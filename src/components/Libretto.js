import React, {Component} from 'react';
import * as StateActions from '../actions/StateActions';
import * as CardActions from '../actions/CardActions';
import CardStore from '../stores/CardStore';
import StateStore from '../stores/StateStore';

//styles
import './Libretto.scss';

class Libretto extends Component {
  constructor(props) {
    super(props)

    this.handleOpenCardsToIndex = this.handleOpenCardsToIndex.bind(this);
    this.setStateViaStore = this.setStateViaStore.bind(this);

    this.state = StateStore.getState(['cardsAreOpen']);
  }

  setStateViaStore() {
    this.setState(StateStore.getState(['cardsAreOpen']));
  }

  componentDidMount() {
    // CardStore.on('NEW_DECK', this.renderCards);
    StateStore.on('STATE_UPDATED', this.setStateViaStore);
  }

  componentWillUnmount() {
    // CardStore.removeListener('NEW_DECK', this.renderCards);
    StateStore.removeListener('STATE_UPDATED', this.setStateViaStore);
  }

  handleOpenCardsToIndex(index) {
    CardActions.setCardPosition(index);
    StateActions.setState({cardsAreOpen: true})
  }

  getHighlightedExchanges() {
    return CardStore.getCards().map((exchange) => {
      return exchange.reduce((a, side, i) => {
        if (i === 1) {
          let matches = side.match(/(<p>.*?:)(.*?)(<\/p>)/)
          let line = matches[2];
          line = line.replace(/\(.*?\)/g, (substr) => `<span class="stage-directions">${substr}</span>`)
          a += `${matches[1]}<span class="highlighted">${line}</span>${matches[3]}`;
        } else {
          a += side.replace(/\(.*?\)/g, (substr) => `<span class="stage-directions">${substr}</span>`);
        }
        return a;
      }, '')
    });
  }

  componentDidUpdate() {
    const currentCardRef = `exchange-${CardStore.getCardPosition()}`;
    if (this.refs[currentCardRef]) {
      if (this.refs[currentCardRef].scrollIntoViewIfNeeded) {
        this.refs[currentCardRef].scrollIntoViewIfNeeded();
      } else if (this.refs[currentCardRef].scrollIntoView) {
        this.refs[currentCardRef].scrollIntoView();
      }
    }
  }

  renderExchanges() {
    return this.getHighlightedExchanges().map((exchange,i) => {
      return (
        <div className="thinkSystem-Libretto-exchange"
          dangerouslySetInnerHTML={{__html: exchange}}
          onClick={ () => this.handleOpenCardsToIndex(i) }
          ref={ `exchange-${i}` }
          key={i} />
      )
    });
  }

  render() {
    if (this.state.cardsAreOpen) return null;
    const exchanges = this.renderExchanges();
    return (
      <div className="thinkSystem-Libretto">
        { exchanges }
      </div>
    )
  }
}

export default Libretto;
