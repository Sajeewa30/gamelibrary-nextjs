import Game from '@/components/game';
import NavBar from '@/components/navBar';

const Favourites = () => {

  return (

    <div>

      <div className="w-[90%] mb-4 mx-auto text-center pt-[50px] pb-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/-background.JPG')] bg-cover bg-center">
        <h1 className='text-white font-bold text-8xl'>Favourites</h1>
      </div>

    <div className="w-[90%] mx-auto text-center pt-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/background.JPG')] bg-cover bg-center">
        <div className="mt-[1%] flex flex-row justify-center flex-wrap">
            <div className='mt-[1%] flex flex-row justify-center flex-wrap'>

                <Game name='Hellblade' year='2024' imageUrl='/Favourites/1.jpg' specialDescription='DESC' />
                <Game name='Hellblade' year='2024' imageUrl='/Favourites/2.jpg' specialDescription='DESC' />
                <Game name='Hellblade' year='2024' imageUrl='/Favourites/3.jpg' specialDescription='DESC' />
                <Game name='Hellblade' year='2024' imageUrl='/Favourites/4.jpg' specialDescription='DESC' />

            </div>
        </div>
    </div>
    

    </div>
  );
}

export default Favourites;