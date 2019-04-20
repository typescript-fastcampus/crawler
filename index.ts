import cron from 'node-cron';
import {JobPlatformEndPoint, Jobs} from "./jobs";
import {forkJoin} from "rxjs/index";

const searchKeyword: string = 'typescript';
const jobs$ = (new Jobs()).getJobs(JobPlatformEndPoint.RocketPunch, searchKeyword);

jobs$.subscribe((job) => {
  console.log('job', job);
})

cron.schedule('* * * * *', () => {
  // const searchKeyword: string = 'typescript';
  // const jobs$ = (new Jobs()).getJobs(JobPlatformEndPoint.RocketPunch, searchKeyword);
  //
  // jobs$.subscribe((job) => {
  //   console.log('job', job);
  // })
});