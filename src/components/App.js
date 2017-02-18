import React, {Component} from 'react';
import FlipCard from './FlipCard';
import ReactSwipe from 'react-swipe';

//styles
import './App.scss';

const swipeOptions = {
  // startSlide: startSlide < paneNodes.length && startSlide >= 0 ? startSlide : 0,
  // auto: parseInt(query.auto, 10) || 0,
  // speed: parseInt(query.speed, 10) || 300,
  // disableScroll: query.disableScroll === 'true',
  // continuous: query.continuous === 'true',
  // callback() {
  //   console.log('slide changed');
  // },
  // transitionEnd() {
  //   console.log('ended transition');
  // }
};

class App extends Component {
  constructor(props) {
    super(props)
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
  }
  
  next() {
    this.refs.reactSwipe.next();
  }

  prev() {
    this.refs.reactSwipe.prev();
  }

  render() {
    return (
      <div>
        <ReactSwipe ref="reactSwipe" className="carousel" swipeOptions={{continuous: false}}>
          <div className="App" style={{width:'300px', height:'300px'}}>
            <FlipCard>
              <div>
                #1 Cue lines here
              </div>
              <div>
                #1 Either you are closing your eyes to a situation
              </div>
            </FlipCard>
          </div>
          <div className="App" style={{width:'300px', height:'300px'}}>
            <FlipCard>
              <div>
                #2 Cue lines here
              </div>
              <div>
                #2 Either you are closing your eyes to a situation
              </div>
            </FlipCard>
          </div>
          <div className="App" style={{width:'300px', height:'300px'}}>
            <FlipCard>
              <div>
                #3 Cue lines here
              </div>
              <div>
                #3 Either you are closing your eyes to a situation
              </div>
            </FlipCard>
          </div>
        </ReactSwipe>
        <div>
          <button type="button" onClick={this.prev}>Prev</button>
          <button type="button" onClick={this.next}>Next</button>
        </div>
      </div>
    )
  }
}

export default App;
