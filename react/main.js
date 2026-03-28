function refreshSetValue(index, value) {
  _states[index] = value;
  _statesCount = 0;
  pagina();
}

var _states = [];
var _statesCount = 0; // index da chamada da funcao useState
function useState(value) {
  const myStateCount = _statesCount++;
  if (value && !_states[myStateCount]) {
    _states[myStateCount] = value;
  }
  return [
    _states[myStateCount],
    (value) => {
      refreshSetValue(myStateCount, value);
    },
  ];
}

function useEffect(fn, arr) {
  for (let i = 0; i < arr.length; i++) {}
}

// ----------------------

function pagina() {
  const [user, setUser] = useState(1);
  const [pagina, setPagina] = useState(100);

  useEffect(() => {
    api.chamada;
  }, [user]);

  console.log({ user });
  console.log({ pagina });

  setTimeout(() => {
    setUser(user + 1);
  }, 3000);
  setTimeout(() => {
    setPagina(pagina + 3);
  }, 5100);
}

pagina();
