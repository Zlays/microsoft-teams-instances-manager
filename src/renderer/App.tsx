import { MemoryRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { Grid } from '@mui/material';
import NavBar from '../containers2/NavBar';
import Main from '../containers2/Main';
import { Home } from '../containers/Home';

const gridStyles = {
  minWidth: '100vw',
};

export default function App() {
  return (
    <Grid container spacing={1} sx={{ ...gridStyles }} direction="column">
      <MemoryRouter>
        <Grid item>
          <NavBar />
        </Grid>
        <Grid item>
          <Main>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </Main>
        </Grid>
      </MemoryRouter>
    </Grid>
  );
}
