import cron from 'node-cron';
import {JobPlatformEndPoint, Jobs} from "./jobs";
import {forkJoin} from "rxjs/index";

cron.schedule('* * * * *', () => {
  //

});