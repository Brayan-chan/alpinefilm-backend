import { app } from './app.js'; import { config } from './config.js';
const server=app.listen(config.PORT,config.HOST,()=>console.log(`AlpineFilm API: http://${config.HOST}:${config.PORT}`));
const stop=(signal:string)=>{console.log(`${signal}: cerrando servidor`);server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),10_000).unref();}; process.on('SIGTERM',()=>stop('SIGTERM'));process.on('SIGINT',()=>stop('SIGINT'));
