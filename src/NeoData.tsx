import React, { ReactNode, useState  } from 'react';
import { useQuery  } from 'react-query';
import { TextField, InputLabel, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';


interface NeoWs {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    meters: {
      estimated_diameter_max: number;
    };
  };
  close_approach_data: {
    epoch_date_close_approach: string;
    close_approach_date_full: string;
    miss_distance: {
      kilometers: number;
    };
    relative_velocity: {
      kilometers_per_hour: number;
    };
  }[];
}

const NeoData = () => {

  // date range 
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10)); 
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleStartDateChange = (e:any) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e:any) => {
    setEndDate(e.target.value);
  };

  const handlePageChange = (page:any) => {
    setCurrentPage(page);
  };

  // today date click function
  const handleTodayClick = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStartDate(today);
    setEndDate(today);
  };

  // fetch neos data 
  const { isLoading, isError, data } = useQuery(['NEOs', startDate, endDate, currentPage], fetchNeoWs);

  function fetchNeoWs() {

    const startParam = 'start_date='+startDate;
    const endParam = 'end_date='+endDate;
    const pageParam = 'page='+currentPage;

    const apiUrl = 'https://api.nasa.gov/neo/rest/v1/feed?'+startParam+'&'+endParam+'&'+pageParam+'&api_key=YBWPBHuJ7X4Rfjibtk8RgkIhdVCgEbuVabXDEm5z';

    return fetch(apiUrl)
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log('neos data from api nasa',data);
      
        // Extract data and sort by close approach time
        const neoList: NeoWs[] = data.near_earth_objects[Object.keys(data.near_earth_objects)[0]];

        neoList.sort((a: NeoWs, b: NeoWs) => {
          const timeA = new Date(a.close_approach_data[0].epoch_date_close_approach);
          const timeB = new Date(b.close_approach_data[0].epoch_date_close_approach);
          return timeB.getTime() - timeA.getTime();
        });
      
        return neoList;
      })
      .catch(error => {
        console.error('There was a problem fetching the NEOs:', error);
      });
  }

  if (isLoading) return <div>Loading</div>;
  if (!data) return <div>Record Not Found</div>;

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div>
      <h2>NEO date range filter</h2>
      <div style={{ display: 'inline-flex', margin: '1%', padding: '1%' }}>
      <div>
        <InputLabel htmlFor="start_date">Start Date: </InputLabel>
        <TextField id="start_date" type="date" value={startDate}  onChange={handleStartDateChange} />
      </div>
      <div>
        <InputLabel htmlFor="end_date">End Date: </InputLabel>
        <TextField id="end_date" type="date" value={endDate} onChange={handleEndDateChange} />
      </div>
      <Button  onClick={handleTodayClick}>Today</Button>
      </div>
  
      <h1>Today most recent near-earth</h1>
      <Table>
        <TableHead>
           <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Asteroid Name</TableCell>
              <TableCell>Potential Hazard</TableCell>
              <TableCell>Estimated Diameter</TableCell>
              <TableCell>Miss Distance</TableCell>
              <TableCell>Velocity</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
          {data.map((neo) => (
            <TableRow key={neo.id}>
              <TableCell>{neo.close_approach_data[0].close_approach_date_full}</TableCell>
              <TableCell>{neo.name}</TableCell>
              <TableCell>{neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</TableCell>
              <TableCell>{Math.round(neo.estimated_diameter.meters.estimated_diameter_max)}</TableCell>
              <TableCell>{Math.round(neo.close_approach_data[0].miss_distance.kilometers)}</TableCell>
              <TableCell>{Math.round(neo.close_approach_data[0].relative_velocity.kilometers_per_hour)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* pagination start */}
      <div>
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next</button>
      </div>
       {/* pagination end */}
    </div>
  );
};

export default NeoData;
