import getFlightsResults from '../services/googleFlight.js';
const cachedData = new Map();

export const getPrices = async (req, res) => {
  const { source, destination, childs, adults, departure } = req.body;
  const {page} = req.query;

  try {
    const data = cachedData.get(`${page}`);
    if(data && cachedData.has(`${source}-${destination}-${departure}-${childs}-${adults}`)){
      return res.json({maxPageSize: cachedData.size-1, result:data});
    }
    else {
      const flights = await getFlightsResults(source, destination, departure, adults, childs);
      console.log(flights);
      cachedData.clear();
      let count = 0;
      let pageNo = 1
      let temp = [];
      for(let i = 0; i <flights.length; i++) {
        if(count<=10){
          temp.push(flights[i]);
          count++;
        }
        else{
          cachedData.set(`${pageNo}`, temp);
          count = 0;
          temp = [];
          pageNo++;
        }
      }
      cachedData.set(`${source}-${destination}-${departure}-${childs}-${adults}`, true);
      temp = [];
      const result = cachedData.get(`${page}`)
      res.json({maxPageSize: cachedData.size-1, result: result || []});
    }

  } catch (error) {

    console.error('Error fetching flight prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch flight prices' });
  }
}

export const Mine = async (req, res) => {
  try {
    return res.json(true)

  } catch (error) {

    console.error('Error fetching flight prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch flight prices' });
  }
}