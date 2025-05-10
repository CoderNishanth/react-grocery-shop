import React from 'react'
import MainBanner from '../components/MainBanner'
import Categories from '../components/Categories';
import BestSeller from '../components/BestSeller';
import BottomBanner from '../components/BottomBanner';
import NewLetter from '../assets/NewLetter';

const Home = () => {
  return (
    <div className='mt-10'>
        <MainBanner/>
        <Categories/>
        <BestSeller/>
        <BottomBanner/>
        <NewLetter/>
    </div>
  )
}

export default Home;