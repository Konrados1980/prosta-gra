// start gry: uruchamiane na końcu, gdy wszystkie pliki są wczytane
resize();
loadRecords();
newGame();
showMenu();
requestAnimationFrame(loop);
