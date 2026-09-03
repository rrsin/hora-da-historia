import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor de histórias a correr em http://localhost:${PORT}`);
});
