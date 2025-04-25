import Game from '@/components/game';
import NavBar from '@/components/navBar';

const TwentyTwentyFive = () => {

  return (

    <div>

      <div className="w-[90%] mb-4 mx-auto text-center pt-[50px] pb-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/-background.JPG')] bg-cover bg-center">
        <h1 className='text-white font-bold text-8xl'>2025</h1>
      </div>

    <div className="w-[90%] mx-auto text-center pt-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/background.JPG')] bg-cover bg-center">
        <div className="mt-[1%] flex flex-row justify-center flex-wrap">
            <div className='mt-[1%] flex flex-row justify-center flex-wrap'>

                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_1.jpg' specialDescription='This is a Single Player Story Mode game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_2.jpg' specialDescription='this is a good game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_3.jpg' specialDescription='this is a good game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_4.jpg' specialDescription='this is a good game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_5.jpg' specialDescription='this is a good game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_6.jpg' specialDescription='this is a good game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_7.jpg' specialDescription='this is a good game.' />
                <Game name='Hellblade' year='2024' imageUrl='/2025/2025_8.jpg' specialDescription='this is a good game.' />

            </div>
        </div>
    </div>
    

    </div>
  );
}

export default TwentyTwentyFive;