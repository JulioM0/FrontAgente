import './Estilos/App.css';
import Navbar from './templates/navbar';
import Contenido from './pages/content'

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Contenido/>
    </div>
  );
}

export default App;
