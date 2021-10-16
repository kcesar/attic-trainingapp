import React, { Component } from 'react'

import Carousel from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import './HomePage.css'

import Image1 from '../assets/can2-checkin.jpg'
import Image2 from '../assets/team-evac.jpg'
import Image3 from '../assets/in-the-woods.jpg'
import Image4 from '../assets/litter-wheel.jpg'

class HomePage extends Component {
  render() {
    const carouselSettings = {
      dots: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 4000
    }

    return (
      <div className='container py-4'>
        <div className='row'>
          <div className='sliderContainer col'>
            <Carousel {...carouselSettings}>
              <div><img src={Image1} alt="Trainees and staff" /></div>
              <div><img src={Image2} alt="Practicing an evacuation" /></div>
              <div><img src={Image3} alt="Searching in the woods" /></div>
              <div><img src={Image4} alt="Working with a wheeled litter (stretcher)" /></div>
            </Carousel>
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <p>Welcome to King County Explorer Search and Rescue's (ESAR's) basic training program. Our series of trainings will
            cover everything necessary to start participating in search and rescue missions in King County and across Washington
            State. Previous training in search and rescue techniques is not required and we'll cover the basics of outdoor travel,
            navigation and first aid.</p>
          </div>
        </div>
        <div className='row'>
          <div className='col'>
            <p>You can learn more about the training program at <a href="http://kcesar.org/recruiting.html">our web site</a></p>
            <p>Existing trainees can sign in below and start tracking their progress.</p>
          </div>
        </div>
        <div className='row justify-content-around'>
          <a href="/me" className='btn btn-primary col-11 col-sm-4 my-2'>Trainee Signin</a>
          {/* <a href="/signup" className='btn btn-outline-primary col-11 col-sm-4 my-2'>Sign Up</a>*/}
        </div> 
      </div>
    );
  }
}

export default HomePage;