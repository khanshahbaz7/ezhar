

export default async function page({params} : {params : Promise<{userId : string}>} ) {

    const {userId} = await params;
    

  return <div>
    
    {userId}
    </div>;
}
