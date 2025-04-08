import {FileType, screen, sleep} from "@computer-use/nut-js";


await sleep(1000);
const t = await screen.capture('screenshot', FileType.PNG);
console.log(t)