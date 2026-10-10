
import { currentUser , auth} from '@clerk/nextjs/server';

const HomePage = async () => {
  const user = await currentUser();
  
  console.log('user' ,user);
  const userId = await auth();


  return (
    <div>
      
    </div>
  )
};
export default HomePage;
