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
                <Game name='Assassins Creed Mirage' year='2023' imageUrl='/2025/2025_1.jpg' specialDescription='' />
                <Game name='Sifu' year='2021' imageUrl='/2025/2025_2.jpg' specialDescription='' />
                <Game name='Death Stranding' year='2019' imageUrl='/2025/2025_3.jpg' specialDescription='' />
                <Game name='It Takes Two' year='2021' imageUrl='/2025/2025_4.jpg' specialDescription='Game Of The Year - 2021' />
                <Game name='The Guardians Of the Galaxy' year='2021' imageUrl='/2025/2025_5.jpg' specialDescription='' />
                <Game name='Spider man 2' year='2023' imageUrl='/2025/2025_6.jpg' specialDescription='' />
                <Game name='Stalker 2' year='2024' imageUrl='/2025/2025_7.jpg' specialDescription='' />
                <Game name='The Last Of Us II' year='2020' imageUrl='/2025/2025_8.jpg' specialDescription='Ellie,Abby,joel,Dina,Jesse,Tommy,Liv.' />
                <Game name='Clair Obscur - Expedition 33' year='2025' imageUrl='/2025/2025_9.jpg' specialDescription='Maelle,Gustave,Sciel,Lune,Verso,Alicia,   Monoco,Esquie,Renoir' />
                <Game name='Call Of Duty MW II' year='2022' imageUrl='/2025/2025_10.jpg' specialDescription='' />
                <Game name='Final Fantasy VII : Rebirth' year='2024' imageUrl='/2025/2025_13.jpg' specialDescription='' />
                <Game name='Need For Speed Unbound' year='2022' imageUrl='/2025/2025_12.jpg' specialDescription='' />
                <Game name='Call Of Duty MW I' year='2019' imageUrl='/2025/2025_10.jpg' specialDescription='' />
                
                <Game name='Call Of Duty Vanguard' year='2021' imageUrl='/2025/2025_11.jpg' specialDescription='' />
                <Game name='Split Fiction' year='2025' imageUrl='/2025/2025_14.jpg' specialDescription='' />
                <Game name='Kingdom Come Deliverance II' year='2025' imageUrl='/2025/2025_15.jpg' specialDescription='' />
                <Game name='Dead Space' year='2023' imageUrl='/2025/2025_16.jpg' specialDescription='This is a remake of the original' />
            </div>
        </div>
    </div>
    

    </div>
  );
}

export default TwentyTwentyFive;