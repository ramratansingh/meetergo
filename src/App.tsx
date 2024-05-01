import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import NeoData from './NeoData';

const queryClient = new QueryClient();

function App() {
return (
    <QueryClientProvider client={queryClient}>
      <NeoData />
    </QueryClientProvider>
 );
}

export default App;