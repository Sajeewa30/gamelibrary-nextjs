import Game from '@/components/game';
import NavBar from '@/components/navBar';

const FullyCompleted = () => {

  return (

    <div>

      <div className="w-[90%] mb-4 mx-auto text-center pt-[50px] pb-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/-background.JPG')] bg-cover bg-center">
        <h1 className='text-white font-bold text-8xl'>100% Completed</h1>
      </div>

    <div className="w-[90%] mx-auto text-center pt-[50px] bg-[linear-gradient(rgba(4,9,30,0.8),rgba(4,9,30,0.8)),url('/background.JPG')] bg-cover bg-center">
        <div className="mt-[1%] flex flex-row justify-center flex-wrap">
            <div className='mt-[1%] flex flex-row justify-center flex-wrap'>
                <Game name='Clair Obscur - Expedition 33' year='2025' imageUrl='/2025/2025_9.jpg' specialDescription='Maelle,Gustave,Sciel,Lune,Verso,Alicia,   Monoco,Esquie,Renoir' />
                <Game name='RDR 2' year='2018' imageUrl='/2025/2025_1.jpg' specialDescription='This is a Single Player Story Mode game.' />
                <Game name='RDR 2' year='2018' imageUrl='/2025/2025_1.jpg' specialDescription='This is a Single Player Story Mode game.' />
                <Game name='RDR 2' year='2018' imageUrl='/2025/2025_1.jpg' specialDescription='This is a Single Player Story Mode game.' />
                <Game name='Clair Obscur - Expedition 33' year='2025' imageUrl='/2025/2025_9.jpg' specialDescription='Maelle,Gustave,Sciel,Lune,Verso,Alicia,   Monoco,Esquie,Renoir' />
                <Game name='RDR 2' year='2018' imageUrl='/2025/2025_1.jpg' specialDescription='This is a Single Player Story Mode game.' />
            </div>
        </div>
    </div>
    

    </div>
  );
}

export default FullyCompleted;