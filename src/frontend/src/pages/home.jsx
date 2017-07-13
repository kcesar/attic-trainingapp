import React, { Component } from 'react'
import { connect } from 'react-redux'

import RaisedButton from 'material-ui/RaisedButton'
import Carousel from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import './home.css'

import Image1 from '../assets/can2-checkin.jpg'
import Image2 from '../assets/team-evac.jpg'
import Image3 from '../assets/in-the-woods.jpg'
import Image4 from '../assets/litter-wheel.jpg'

class HomePage extends Component {
  componentWillMount() {
    const { doIt } = this.props;
    doIt();
  }

  render() {
    const carouselSettings = {
      dots: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000
    }

    return (
      <div className='content'>
      <div className='content'>
  <div className='sliderContainer'>
    <Carousel {...carouselSettings} settings={carouselSettings}>
      <div><img src={Image1} /></div>
      <div><img src={Image2} /></div>
      <div><img src={Image3} /></div>
      <div><img src={Image4} /></div>
    </Carousel>
    </div>
      <p>
        Welcome to King County Explorer Search and Rescue's (ESAR's) basic training program. Our series of trainings will
        cover everything necessary to start participating in search and rescue missions in King County and across Washington
        State. Previous training in search and rescue techniques is not required and we'll cover the basics of outdoor travel,
        navigation and first aid.</p>
      <p>In order to participate in our training please use the sign up form and start tracking your progress.</p>
      <div style={{display:'flex', flexDirection:'row', justifyContent:'center', alignContent:'stretch', width:'800px'}}>
        <RaisedButton label="Existing Trainees" href="/me" primary={true} style={{display:'flex', flex: '1 1 0%', margin:'0 10px'}} />
        <RaisedButton label="Sign up" href="/signup" style={{display:'flex', flex: '1 1 0%', margin:'0 10px'}} />
      </div>
    </div>
  </div>

 
    );
  }
}

const storeToProps = (store) => {
  return {
    route: store.routing
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    doIt: () => dispatch({type: 'MY_ACTION'})
  }
}

export default connect(storeToProps, dispatchToProps)(HomePage);