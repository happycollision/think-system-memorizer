import React, {Component} from 'react';

//styles
import './FlipCard.scss';

class FlipCard extends Component {
  render() {
    if ( ! this.props.children ) return null;
    const [front, back] = this.props.children;
    return (
      <div className="FlipCard">
        {front}
        {back}
      </div>
    )
  }
}

export default FlipCard;
