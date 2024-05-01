import React, { useState } from 'react';
import { useQuery  } from 'react-query';
import { TextField, InputLabel, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

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

        const neoList:any = [];
        Object.keys(data.near_earth_objects).forEach(date => {
          const neoData = data.near_earth_objects[date];
          neoList.push(
            ...neoData.map((neo: any)  => ({
              id: neo.id,
              time: neo.close_approach_data[0].close_approach_date_full,
              epoch_date_close_approach: neo.close_approach_data[0].epoch_date_close_approach,
              name: neo.name,
              potentialHazard: neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No',
              estimatedDiameter: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
              missDistance: Math.round(neo.close_approach_data[0].miss_distance.kilometers),
              velocity: Math.round(neo.close_approach_data[0].relative_velocity.kilometers_per_hour)
            }))
          );
        });

        // sort neo data
        neoList.sort((a:any, b:any) => {
          const timeA = new Date(a.epoch_date_close_approach);
          const timeB = new Date(b.epoch_date_close_approach);
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

  // pagination  start
  const totalPages = Math.ceil(data.length / pageSize);
  console.log('totalPages',totalPages);

  // Calculate the range of NEOs to display for the current page
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  // Extract the NEOs for the current page
  const pageNEOs = data.slice(startIndex, endIndex);
  // pagination end

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
          {pageNEOs.map((neo:any) => (
            <TableRow key={neo.id}>
              <TableCell>{neo.time}</TableCell>
              <TableCell>{neo.name}</TableCell>
              <TableCell>{neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}</TableCell>
              <TableCell>{Math.round(neo.estimatedDiameter)}</TableCell>
              <TableCell>{Math.round(neo.missDistance)}</TableCell>
              <TableCell>{Math.round(neo.velocity)}</TableCell>
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
